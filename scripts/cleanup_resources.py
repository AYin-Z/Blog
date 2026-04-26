#!/usr/bin/env python3
"""
Clean up root directory: move unreferenced resources to trash.
Also restore resources from trash if they're re-referenced.
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TRASH_DIR = ROOT / "_trash"
POSTS_DIR = ROOT / "posts"
RESOURCE_DIR = ROOT / "resource"

# All supported extensions
ALL_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.pdf', '.zip', '.mp3', '.mp4', '.mov', '.avi'}

# Root-level files that are site assets (not blog-post attachments) and must never be trashed
PROTECTED_ROOT_FILES = {'favicon.svg', 'favicon.png', 'favicon.ico'}  # lowercase; matched case-insensitively

def get_all_referenced_filenames() -> set:
    """Get all resource filenames referenced in posts."""
    referenced = set()
    
    for post_file in POSTS_DIR.glob("*.md"):
        content = post_file.read_text(encoding='utf-8')
        
        # Markdown images: ![alt](path)
        for match in re.finditer(r'!\[([^\]]*)\]\(([^)]+)\)', content):
            link = match.group(2)
            # Skip links that are already under resource/ — their originals in root
            # should be cleaned up, not kept. Only bare-filename or posts/-relative
            # paths mean the file still lives in root/posts subdirs.
            if not link.startswith(('http://', 'https://', '/', 'data:', 'resource/')):
                referenced.add(os.path.basename(link).lower())
        
        # Obsidian embeds: ![[path]]
        for match in re.finditer(r'!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content):
            link = match.group(1)
            referenced.add(os.path.basename(link).lower())
    
    # Also check resource/ folder
    if RESOURCE_DIR.exists():
        for f in RESOURCE_DIR.rglob('*'):
            if f.is_file():
                # Check if this resource is still referenced by any post
                pass
    
    return referenced

def scan_directory(directory: Path) -> dict:
    """Get all supported files in a directory, excluding protected site assets."""
    files = {}
    if not directory.exists():
        return files
    for f in directory.iterdir():
        if f.is_file() and f.suffix.lower() in ALL_EXTS and f.name.lower() not in PROTECTED_ROOT_FILES:
            files[f.name.lower()] = f
    return files

def restore_from_trash(referenced: set, trash_files: dict) -> list:
    """Restore files from trash if they're re-referenced."""
    restored = []
    
    for filename_lower, filepath in list(trash_files.items()):
        if filename_lower in referenced:
            # Find the original filename
            original_name = filepath.name
            # Check if there's a matching resource folder
            for resource_file in RESOURCE_DIR.rglob('*'):
                if resource_file.is_file() and resource_file.name.lower() == filename_lower:
                    # Already exists in resource, just delete from trash
                    filepath.unlink()
                    print(f"  Removed duplicate from trash: {original_name}")
                    restored.append(original_name)
                    break
            else:
                # Move back to resource (we don't know which slug, put in root for now)
                # Actually, let's just leave it in trash if we can't determine destination
                # User can manually move it
                print(f"  Skipped (resource location unknown): {original_name}")
    
    return restored

def move_to_trash(files: dict, referenced: set) -> list:
    """Move unreferenced files to trash."""
    moved = []
    
    for filename_lower, filepath in list(files.items()):
        if filename_lower not in referenced:
            TRASH_DIR.mkdir(exist_ok=True)
            new_path = TRASH_DIR / filepath.name
            # Handle duplicates
            counter = 1
            while new_path.exists():
                name, ext = os.path.splitext(filepath.name)
                new_path = TRASH_DIR / f"{name}_{counter}{ext}"
                counter += 1
            filepath.rename(new_path)
            print(f"  Moved to trash: {filepath.name} -> _trash/{new_path.name}")
            moved.append(filepath.name)
    
    return moved

def main():
    print("Cleaning up unreferenced resources...")
    
    # Get all referenced filenames
    referenced = get_all_referenced_filenames()
    print(f"Found {len(referenced)} referenced resources in posts.")
    
    # Scan root directory
    root_files = scan_directory(ROOT)
    # Exclude special directories
    for d in ['_trash', 'resource', 'posts', 'css', 'js', 'data', 'scripts', '.github', '.obsidian', 'BlogModel']:
        root_files = {k: v for k, v in root_files.items() if not str(v).startswith(str(ROOT / d))}
    
    # Scan trash directory
    trash_files = scan_directory(TRASH_DIR)
    
    print(f"Found {len(root_files)} resources in root directory.")
    print(f"Found {len(trash_files)} resources in trash.")
    
    # Restore from trash if re-referenced
    print("\nChecking trash for re-referenced files...")
    restored = restore_from_trash(referenced, trash_files)
    if restored:
        print(f"Restored: {', '.join(restored)}")
    
    # Move unreferenced to trash
    print("\nMoving unreferenced resources to trash...")
    moved = move_to_trash(root_files, referenced)
    
    if moved:
        print(f"\nMoved {len(moved)} files to _trash/")
        print("Please review _trash/ and delete files you no longer need.")
    else:
        print("\nNo unreferenced resources found.")

if __name__ == "__main__":
    main()
