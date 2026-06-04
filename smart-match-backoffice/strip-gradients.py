"""Strip all linear-gradient/radial-gradient usage from backoffice SCSS+TS files.

Replaces each gradient expression with the first parseable color argument
(skipping direction tokens such as "135deg", "to right", "circle at 50% 0%").
Preserves indentation and the surrounding declaration.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "src"
DIRECTION_TOKENS = re.compile(
    r"^(\d+deg|to\s+\w+(?:\s+\w+)?|circle(?:\s+at\s+[^,]+)?|ellipse(?:\s+at\s+[^,]+)?|at\s+[^,]+)$"
)
COLOR_TOKEN = re.compile(
    r"^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|var\([^)]*\)|[a-zA-Z][a-zA-Z0-9_-]*)(?:\s+\d+%)?$"
)


def find_matching_paren(text: str, open_idx: int) -> int:
    depth = 0
    for i in range(open_idx, len(text)):
        ch = text[i]
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return i
    return -1


def split_args(payload: str) -> list[str]:
    args: list[str] = []
    depth = 0
    buf = []
    for ch in payload:
        if ch == "(":
            depth += 1
            buf.append(ch)
        elif ch == ")":
            depth -= 1
            buf.append(ch)
        elif ch == "," and depth == 0:
            args.append("".join(buf).strip())
            buf = []
        else:
            buf.append(ch)
    if buf:
        args.append("".join(buf).strip())
    return args


def first_color(args: list[str]) -> str | None:
    for raw in args:
        token = raw.strip()
        if not token:
            continue
        # Strip trailing position percentage (e.g. "#fff 35%").
        candidate = token
        m = re.match(r"^(.*?)\s+\d+%\s*$", candidate)
        if m:
            candidate = m.group(1).strip()
        if DIRECTION_TOKENS.match(candidate):
            continue
        if COLOR_TOKEN.match(candidate):
            return candidate
        # Pull leading var(...) or rgba(...) even with trailing junk.
        for prefix_match in (
            re.match(r"^var\([^)]*\)", candidate),
            re.match(r"^rgba?\([^)]*\)", candidate),
            re.match(r"^#[0-9a-fA-F]{3,8}", candidate),
        ):
            if prefix_match:
                return prefix_match.group(0)
    return None


def strip_gradients(text: str) -> tuple[str, int]:
    out = []
    i = 0
    replacements = 0
    pattern = re.compile(r"(linear-gradient|radial-gradient)\(")
    while True:
        match = pattern.search(text, i)
        if not match:
            out.append(text[i:])
            break
        out.append(text[i: match.start()])
        end = find_matching_paren(text, match.end() - 1)
        if end == -1:
            out.append(text[match.start():])
            break
        payload = text[match.end(): end]
        args = split_args(payload)
        color = first_color(args) or "var(--surface)"
        out.append(color)
        i = end + 1
        replacements += 1
    return "".join(out), replacements


def main() -> int:
    total = 0
    changed_files: list[Path] = []
    for path in ROOT.rglob("*"):
        if path.suffix not in {".scss", ".ts", ".html"}:
            continue
        original = path.read_text(encoding="utf-8")
        if "gradient(" not in original:
            continue
        updated, count = strip_gradients(original)
        if count and updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            total += count
            changed_files.append(path)
    for f in changed_files:
        print(f"updated {f.relative_to(ROOT.parent)}")
    print(f"total replacements: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
