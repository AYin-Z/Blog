#!/usr/bin/env python3
"""
Scan posts/*.md for embedded resources, find them in root directory,
move images to resource/{slug}/ folder, and convert post links.
"""
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
RESOURCE_DIR = ROOT / "resource"

# Image extensions
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'}
# All supported extensions
ALL_EXTS = IMAGE_EXTS | {'.pdf', '.zip', '.mp3', '.mp4', '.mov', '.avi'}

def is_image(filename: str) -> bool:
    """Check if filename is an image."""
    lower = filename.lower()
    return any(lower.endswith(ext) for ext in IMAGE_EXTS)

def find_resources_in_file(filepath: Path) -> list:
    """
    Find all resource references in a markdown file.
    Returns list of (full_match, link_path, is_image) tuples.
    """
    resources = []
    content = filepath.read_text(encoding='utf-8')
    
    # Match markdown images: ![alt](path)
    img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    for match in re.finditer(img_pattern, content):
        link = match.group(2)
        if link.startswith(('http://', 'https://', '/', 'data:', 'resource/')):
            continue
        filename = os.path.basename(link)
        resources.append((match.group(0), link, is_image(filename)))
    
    # Match Obsidian embeds: ![[path|alias]]
    embed_pattern = r'!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]'
    for match in re.finditer(embed_pattern, content):
        link = match.group(1)
        filename = os.path.basename(link)
        resources.append((match.group(0), link, is_image(filename)))
    
    return resources

def get_all_root_files() -> dict:
    """Get all attachment files in root directory."""
    files = {}
    for f in ROOT.iterdir():
        if f.is_file() and f.suffix.lower() in ALL_EXTS:
            files[f.name.lower()] = f
    return files

def slugify(title: str) -> str:
    """Convert title to URL-safe slug."""
    # Remove file extension
    title = re.sub(r'\.md$', '', title)
    return title

def process_post(post_file: Path, root_files: dict) -> bool:
    """
    Process a single post: find resources, move images, convert post links.
    Returns True if any changes were made.
    """
    slug = post_file.stem
    content = post_file.read_text(encoding='utf-8')
    changes_made = False
    
    # Create resource directory
    resource_post_dir = RESOURCE_DIR / slug
    resource_post_dir.mkdir(parents=True, exist_ok=True)
    
    for full_match, link, is_img in find_resources_in_file(post_file):
        filename = os.path.basename(link)
        filename_lower = filename.lower()
        
        if is_img:
            # Handle image: move to resource folder
            if filename_lower not in root_files:
                continue
            
            source_file = root_files[filename_lower]
            new_path = resource_post_dir / filename
            
            # Copy file to resource folder
            shutil.copy2(source_file, new_path)
            
            # Update link to resource path
            new_link = f"resource/{slug}/{filename}"
            content = content.replace(full_match, f"![]({new_link})", 1)
            changes_made = True
            print(f"  [IMAGE] {filename} -> resource/{slug}/")
        else:
            # Handle post reference: convert to link
            post_slug = slugify(filename)
            # Convert ![[xxx|alias]] or [[xxx|alias]] to link
            content = re.sub(
                r'!?\[\[([^\]|]+)\|([^\]]+)\]\]',
                f'<a href="post.html?slug={post_slug}">\\2</a>',
                content,
                count=1
            )
            # Also handle ![[xxx]]
            content = re.sub(
                r'!\[\[([^\]|]+)\]\]',
                f'<a href="post.html?slug={post_slug}">\\1</a>',
                content,
                count=1
            )
            changes_made = True
            print(f"  [POST] {filename} -> post.html?slug={post_slug}")
    
    if changes_made:
        post_file.write_text(content, encoding='utf-8')
    
    return changes_made

def main():
    print("Scanning posts for embedded resources...")
    
    root_files = get_all_root_files()
    print(f"Found {len(root_files)} attachment files in root directory.")
    
    changes_made = False
    
    for post_file in sorted(POSTS_DIR.glob("*.md")):
        if process_post(post_file, root_files):
            changes_made = True
            print(f"Updated: {post_file.name}")
    
    if changes_made:
        print("\nResource organization complete!")
    else:
        print("\nNo changes needed.")

if __name__ == "__main__":
    main()
