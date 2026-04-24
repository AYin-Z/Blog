#!/usr/bin/env python3
"""
Scan posts/*.md for embedded resources (images, attachments),
move them to resource/{slug}/ folder, and update the links in articles.
"""
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
RESOURCE_DIR = ROOT / "resource"

# Image extensions to track
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'}
# Other attachment extensions
ATTACHMENT_EXTS = {'.pdf', '.zip', '.mp3', '.mp4', '.mov', '.avi'}

def get_all_extensions():
    return IMAGE_EXTS | ATTACHMENT_EXTS

def find_resources_in_file(filepath: Path) -> list[tuple[str, str]]:
    """
    Find all resource references in a markdown file.
    Returns list of (original_link, absolute_path) tuples.
    """
    resources = []
    content = filepath.read_text(encoding='utf-8')
    
    # Match markdown images: ![alt](path)
    img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    for match in re.finditer(img_pattern, content):
        link = match.group(2)
        # Skip external URLs and absolute paths
        if link.startswith(('http://', 'https://', '/', 'data:')):
            continue
        resources.append((match.group(0), link))
    
    # Match Obsidian embeds: ![[path]]
    embed_pattern = r'!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]'
    for match in re.finditer(embed_pattern, content):
        link = match.group(1)
        resources.append((match.group(0), link))
    
    return resources

def process_slug(slug: str) -> bool:
    """
    Process a single post: move resources and update links.
    Returns True if any changes were made.
    """
    post_file = POSTS_DIR / f"{slug}.md"
    if not post_file.exists():
        return False
    
    # Check if post has a subfolder for attachments
    post_attachments_dir = POSTS_DIR / slug
    if not post_attachments_dir.exists():
        return False
    
    content = post_file.read_text(encoding='utf-8')
    original_content = content
    changes_made = False
    
    # Create resource directory
    resource_post_dir = RESOURCE_DIR / slug
    resource_post_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all files in the attachments folder
    attachment_files = {}
    for f in post_attachments_dir.rglob('*'):
        if f.is_file():
            attachment_files[f.name.lower()] = f
    
    # Process each resource reference
    for full_match, link in find_resources_in_file(post_file):
        # Clean up the link
        clean_link = link.strip()
        
        # Get filename from link
        filename = os.path.basename(clean_link)
        filename_lower = filename.lower()
        
        # Check if this file exists in attachments folder
        if filename_lower not in attachment_files:
            continue
        
        source_file = attachment_files[filename_lower]
        
        # Determine new filename (use original case)
        new_filename = filename
        new_path = resource_post_dir / new_filename
        
        # Handle duplicate filenames
        counter = 1
        while new_path.exists() and new_path.read_bytes() != source_file.read_bytes():
            name, ext = os.path.splitext(new_filename)
            new_filename = f"{name}_{counter}{ext}"
            new_path = resource_post_dir / new_filename
            counter += 1
        
        # Copy file to resource folder
        shutil.copy2(source_file, new_path)
        
        # Generate new link
        new_link = f"resource/{slug}/{new_filename}"
        
        # Replace link in content
        # Handle different link formats
        if full_match.startswith('![['):
            # Obsidian embed: ![[file]] or ![[file|alias]]
            new_match = f"![]({new_link})"
        else:
            # Markdown image: ![alt](path)
            new_match = f"![]({new_link})"
        
        content = content.replace(full_match, new_match, 1)
        changes_made = True
        print(f"  {link} -> {new_link}")
    
    if changes_made:
        post_file.write_text(content, encoding='utf-8')
        
        # Remove the old attachments folder if empty or only contains processed files
        _cleanup_folder(post_attachments_dir)
    
    return changes_made

def _cleanup_folder(folder: Path):
    """Remove empty folders recursively."""
    if not folder.exists():
        return
    
    for item in folder.rglob('*'):
        if item.is_dir():
            _cleanup_folder(item)
    
    # Remove if empty
    if not any(folder.iterdir()):
        folder.rmdir()
        print(f"  Removed empty folder: {folder.relative_to(ROOT)}")

def main():
    print("Scanning posts for embedded resources...")
    
    changes_made = False
    
    for post_file in POSTS_DIR.glob("*.md"):
        slug = post_file.stem
        print(f"\nProcessing: {slug}")
        
        if process_slug(slug):
            changes_made = True
            print(f"  Updated: {post_file.relative_to(ROOT)}")
    
    if changes_made:
        print("\nResource organization complete!")
    else:
        print("\nNo resources to organize.")

if __name__ == "__main__":
    main()
