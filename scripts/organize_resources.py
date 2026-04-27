#!/usr/bin/env python3
"""
Scan posts/*.md for embedded resources, find them in root directory
and posts/{slug}/ subdirectories, move images to resource/{slug}/,
and convert post links.
"""
import os
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from log_utils import Logger

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

def get_all_post_subdir_files() -> dict:
    """Get all attachment files in posts/{slug}/ subdirectories."""
    files = {}
    if not POSTS_DIR.exists():
        return files
    for subdir in POSTS_DIR.iterdir():
        if subdir.is_dir():
            for f in subdir.iterdir():
                if f.is_file() and f.suffix.lower() in ALL_EXTS:
                    key = f.name.lower()
                    if key in files:
                        print(
                            f"  warn: duplicate attachment name '{f.name}' found in "
                            f"posts/{subdir.name}/ and posts/{files[key].parent.name}/; "
                            f"using the first one found — rename one to avoid misassignment",
                            file=sys.stderr,
                        )
                    else:
                        files[key] = f
    return files

def find_file(filename_lower: str, root_files: dict, subdir_files: dict) -> Path | None:
    """Find a file by its lowercase name in root or posts subdirectories."""
    if filename_lower in root_files:
        return root_files[filename_lower]
    if filename_lower in subdir_files:
        return subdir_files[filename_lower]
    return None

def process_post(post_file: Path, root_files: dict, subdir_files: dict, moved_sources: set, log: Logger) -> bool:
    """
    Process a single post: find resources, move images, convert post links.
    Returns True if any changes were made.
    moved_sources: set of source Path objects that have been moved (shared across all posts).
    """
    slug = post_file.stem
    try:
        content = post_file.read_text(encoding='utf-8')
    except Exception as e:
        log.error(f"Cannot read {post_file.name}", context=str(post_file), exc=e)
        return False
    changes_made = False

    # Create resource directory
    try:
        resource_post_dir = RESOURCE_DIR / slug
        resource_post_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        log.error(f"Cannot create resource dir for {slug}", context=str(resource_post_dir), exc=e)
        return False

    for full_match, link, is_img in find_resources_in_file(post_file):
        filename = os.path.basename(link)
        filename_lower = filename.lower()

        if is_img:
            # Handle image: find and move to resource folder
            source_file = find_file(filename_lower, root_files, subdir_files)
            if source_file is None:
                continue

            new_path = resource_post_dir / filename

            # Copy file to resource folder, then schedule source for deletion.
            # copy2 + deferred deletion (rather than shutil.move) is intentional:
            # the same source filename can be referenced by multiple posts, each
            # needing its own independent copy in resource/{slug}/.  We collect all
            # sources and remove them after the entire loop completes.
            try:
                shutil.copy2(source_file, new_path)
            except OSError as e:
                log.error(f"Cannot copy {filename} to resource/{slug}/", context=str(source_file), exc=e)
                continue
            moved_sources.add(source_file)

            # Update link to resource path
            new_link = f"resource/{slug}/{filename}"
            content = content.replace(full_match, f"![]({new_link})")
            changes_made = True
            log.info(f"  [IMAGE] {filename} -> resource/{slug}/")
        else:
            # Handle post reference: convert to link
            post_slug = filename.replace('.md', '')
            # Convert ![[xxx|alias]] to link
            content = re.sub(
                r'!\[\[([^\]|]+)\|([^\]]+)\]\]',
                f'<a href="post.html?slug={post_slug}">\\2</a>',
                content,
                count=1
            )
            # Convert ![[xxx]] to link
            content = re.sub(
                r'!\[\[([^\]|]+)\]\]',
                f'<a href="post.html?slug={post_slug}">\\1</a>',
                content,
                count=1
            )
            changes_made = True
            log.info(f"  [POST] {filename} -> post.html?slug={post_slug}")

    if changes_made:
        try:
            post_file.write_text(content, encoding='utf-8')
        except OSError as e:
            log.error(f"Cannot write updated content to {post_file.name}", context=str(post_file), exc=e)
            return False

    return changes_made

def cleanup_empty_dirs():
    """Remove empty subdirectories in posts/."""
    if not POSTS_DIR.exists():
        return
    for subdir in list(POSTS_DIR.iterdir()):
        if subdir.is_dir():
            # Only remove if all files are images/attachments (not .md)
            has_md = any(f.suffix == '.md' for f in subdir.iterdir())
            if not has_md and not any(f for f in subdir.iterdir()):
                subdir.rmdir()
                print(f"  Removed empty dir: posts/{subdir.name}/")

def cleanup_orphaned_subdir_files():
    """
    Remove attachment files from posts/{slug}/ subdirectories that have already
    been organized into resource/{slug}/.  These are leftovers from a previous
    run that used shutil.copy2 instead of deleting the original.
    """
    if not POSTS_DIR.exists():
        return
    for subdir in POSTS_DIR.iterdir():
        if not subdir.is_dir():
            continue
        slug = subdir.name
        for f in list(subdir.iterdir()):
            if f.is_file() and f.suffix.lower() in ALL_EXTS:
                resource_copy = RESOURCE_DIR / slug / f.name
                if resource_copy.exists():
                    f.unlink()
                    print(f"  Removed orphaned subdir file: posts/{slug}/{f.name}")

def main():
    log = Logger("organize_resources")
    log.info("Scanning posts for embedded resources...")

    root_files = get_all_root_files()
    subdir_files = get_all_post_subdir_files()
    log.info(f"Found {len(root_files)} files in root directory")
    log.info(f"Found {len(subdir_files)} files in posts/ subdirectories")

    changes_made = False
    moved_sources: set = set()

    for post_file in sorted(POSTS_DIR.glob("*.md")):
        if process_post(post_file, root_files, subdir_files, moved_sources, log):
            changes_made = True
            log.info(f"Updated: {post_file.name}")

    # Delete original source files that were copied to resource/
    for src in moved_sources:
        if src.exists():
            try:
                src.unlink()
                log.info(f"  Deleted source: {src}")
            except OSError as e:
                log.error(f"Cannot delete source file {src.name}", context=str(src), exc=e)

    # Clean up leftover attachment files in posts/ subdirectories
    cleanup_orphaned_subdir_files()

    # Clean up empty directories
    cleanup_empty_dirs()

    if changes_made:
        log.info("Resource organization complete!")
    else:
        log.info("No changes needed.")

    sys.exit(log.summary())

if __name__ == "__main__":
    main()
