#!/usr/bin/env python3
"""
Scan posts/*.md (top level only), read YAML front matter, write posts.json.
Slug = filename without .md. Matches site fields: title, date, excerpt, category, tags, pinned.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
OUT = ROOT / "posts.json"


def split_front_matter(text: str) -> tuple[dict, str]:
    if not text.startswith("---"):
        return {}, text
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n", text)
    if not m:
        return {}, text
    raw = m.group(1)
    body = text[m.end() :]
    try:
        meta = yaml.safe_load(raw) or {}
    except yaml.YAMLError as e:
        print(f"YAML error: {e}", file=sys.stderr)
        raise
    if not isinstance(meta, dict):
        meta = {}
    return meta, body


def first_line_excerpt(body: str, max_len: int = 160) -> str:
    for line in body.splitlines():
        s = line.strip()
        if not s:
            continue
        s = re.sub(r"^#+\s*", "", s)
        s = re.sub(r"[*_`]+", "", s)
        if len(s) > max_len:
            return s[: max_len - 3].rstrip() + "..."
        return s
    return ""


DEFAULT_CATEGORY = "孤岛"


def normalize_category(meta: dict) -> str:
    if meta.get("category") is not None:
        c = meta["category"]
        return str(c).strip() or DEFAULT_CATEGORY
    cats = meta.get("categories")
    if isinstance(cats, list) and cats:
        return str(cats[0]).strip() or DEFAULT_CATEGORY
    if isinstance(cats, str) and cats.strip():
        return cats.strip()
    return DEFAULT_CATEGORY


def normalize_tags(meta: dict) -> list[str]:
    t = meta.get("tags")
    if t is None:
        return []
    if isinstance(t, str):
        return [t.strip()] if t.strip() else []
    if isinstance(t, list):
        return [str(x).strip() for x in t if str(x).strip()]
    return []


def normalize_date(meta: dict, slug: str) -> str:
    d = meta.get("date")
    if d is None:
        print(f"warn: {slug}.md missing date, using 1970-01-01", file=sys.stderr)
        return "1970-01-01"
    if hasattr(d, "strftime"):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return s
    if re.match(r"^\d{4}-\d{2}-\d{2}\s", s):
        return s[:10]
    return s[:10] if len(s) >= 10 else "1970-01-01"


def normalize_pinned(meta: dict) -> bool:
    v = meta.get("pinned", False)
    if isinstance(v, str):
        return v.lower() in ("true", "1", "yes")
    return bool(v)


def build_entry(path: Path) -> dict:
    slug = path.stem
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        # Try with fallback encoding
        try:
            text = path.read_text(encoding="latin-1")
        except Exception as e:
            print(f"Error reading {slug}.md: {e}", file=sys.stderr)
            raise
    meta, body = split_front_matter(text)
    title = meta.get("title")
    if title is None or str(title).strip() == "":
        title = slug
    else:
        title = str(title).strip()
    excerpt = meta.get("excerpt")
    if excerpt is None or str(excerpt).strip() == "":
        excerpt = first_line_excerpt(body)
    else:
        excerpt = str(excerpt).strip()
    return {
        "slug": slug,
        "title": title,
        "date": normalize_date(meta, slug),
        "excerpt": excerpt,
        "category": normalize_category(meta),
        "tags": normalize_tags(meta),
        "pinned": normalize_pinned(meta),
    }


def main() -> None:
    if not POSTS_DIR.is_dir():
        print("posts/ not found", file=sys.stderr)
        sys.exit(1)
    paths = sorted(POSTS_DIR.glob("*.md"))
    print(f"Found {len(paths)} markdown files in posts/")
    
    entries = []
    errors = []
    for p in paths:
        try:
            entry = build_entry(p)
            entries.append(entry)
        except Exception as e:
            errors.append((p.name, str(e)))
            print(f"Error processing {p.name}: {e}", file=sys.stderr)
    
    if errors:
        print(f"\nWARN: Failed to process {len(errors)} file(s):", file=sys.stderr)
        for fname, err in errors:
            print(f"  {fname}: {err}", file=sys.stderr)
        print("These files are excluded from posts.json.", file=sys.stderr)
    
    pinned = [e for e in entries if e["pinned"]]
    unpinned = [e for e in entries if not e["pinned"]]
    pinned.sort(key=lambda e: e["date"], reverse=True)
    unpinned.sort(key=lambda e: e["date"], reverse=True)
    ordered = pinned + unpinned

    OUT.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(ordered)} posts to posts.json")


if __name__ == "__main__":
    main()
