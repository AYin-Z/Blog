#!/usr/bin/env python3
"""
Scan posts/*.md for embedded resources, find them in root directory,
move to resource/{slug}/ folder, and update the links in articles.
"""
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
RESOURCE_DIR = ROOT / "resource"

# All supported extensions
ALL_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.pdf', '.zip', '.mp3', '.mp4', '.mov', '.avi'}

def find_resources_in_file(filepath: Path) -> list[tuple[str, str]]:
    """
    Find all resource references in a markdown file.
    Returns list of (full_match, link_path) tuples.
    """
    resources = []
    content = filepath.read_text(encoding='utf-8')
    
    # Match markdown images: ![alt](path)
    img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    for match in re.finditer(img_pattern, content):
        link = match.group(2)
        if link.startswith(('http://', 'https://', '/', 'data:', 'resource/')):
            continue
        resources.append((match.group(0), link))
    
    # Match Obsidian embeds: ![[path]]
    embed_pattern = r'!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]'
    for match in re.finditer(embed_pattern, content):
        link = match.group(1)
        resources.append((match.group(0), link))
    
    return resources

def get_all_root_files() -> dict:
    """Get all attachment files in root directory."""
    files = {}
    for f in ROOT.iterdir():
        if f.is_file() and f.suffix.lower() in ALL_EXTS:
            files[f.name.lower()] = f
    return files

def process_post(post_file: Path, root_files: dict) -> bool:
    """
    Process a single post: find resources, move them, update links.
    Returns True if any changes were made.
    """
    slug = post_file.stem
    content = post_file.read_text(encoding='utf-8')
    original_content = content
    changes_made = False
    
    # Create resource directory
    resource_post_dir = RESOURCE_DIR / slug
    resource_post_dir.mkdir(parents=True, exist_ok=True)
    
    for full_match, link in find_resources_in_file(post_file):
        # Get filename from link
        filename = os.path.basename(link)
        filename_lower = filename.lower()
        
        # Check if file exists in root
        if filename_lower not in root_files:
            continue
        
        source_file = root_files[filename_lower]
        
        # New path in resource folder
        new_filename = filename
        new_path = resource_post_dir / new_filename
        
        # Copy file to resource folder
        shutil.copy2(source_file, new_path)
        
        # Generate new link
        new_link = f"resource/{slug}/{new_filename}"
        
        # Replace link in content
        if full_match.startswith('![['):
            new_match = f"![]({new_link})"
        else:
            new_match = f"![]({new_link})"
        
        content = content.replace(full_match, new_match, 1)
        changes_made = True
        print(f"  {filename} -> resource/{slug}/")
    
    if changes_made:
        post_file.write_text(content, encoding='utf-8')
    
    return changes_made

def main():
    print("Scanning posts for embedded resources in root directory...")
    
    root_files = get_all_root_files()
    if not root_files:
        print("No attachment files found in root directory.")
        return
    
    print(f"Found {len(root_files)} files in root directory: {', '.join(f.name for f in root_files.values())}")
    
    changes_made = False
    
    for post_file in sorted(POSTS_DIR.glob("*.md")):
        slug = post_file.stem
        if process_post(post_file, root_files):
            changes_made = True
            print(f"Updated: {post_file.name}")
    
    if changes_made:
        print("\nResource organization complete!")
    else:
        print("\nNo resources to organize.")

if __name__ == "__main__":
    main()
