#!/usr/bin/env python3
"""
Structured logging with GitHub Actions workflow-command support.

Usage:
    from log_utils import Logger
    log = Logger("my-script")
    log.info("processing foo")
    log.warn("skipping bar", context="posts/bar.md")
    log.error("failed to read baz", context="posts/baz.md", exc=e)
    sys.exit(log.summary())
"""
from __future__ import annotations

import os
import sys
import traceback

_IS_GHA = os.environ.get("GITHUB_ACTIONS") == "true"


class Logger:
    """Collect INFO / WARN / ERROR messages; emit GHA annotations in CI."""

    def __init__(self, script_name: str) -> None:
        self._name = script_name
        self._warnings: list[str] = []
        self._errors: list[tuple[str, str]] = []

    # ------------------------------------------------------------------
    # Logging primitives
    # ------------------------------------------------------------------

    def info(self, msg: str) -> None:
        print(f"[INFO]  {msg}", flush=True)

    def warn(self, msg: str, *, context: str = "") -> None:
        """Non-fatal issue; workflow continues but summary reports it."""
        self._warnings.append(msg)
        if _IS_GHA:
            ctx = f",file={context}" if context else ""
            print(f"::warning{ctx}::{msg}", flush=True)
        else:
            print(f"[WARN]  {msg}", file=sys.stderr, flush=True)

    def error(
        self,
        msg: str,
        *,
        context: str = "",
        exc: BaseException | None = None,
    ) -> None:
        """Fatal issue for this item; recorded and reported in summary."""
        full = f"{msg}: {exc}" if exc else msg
        self._errors.append((context or self._name, full))
        if _IS_GHA:
            ctx = f",file={context}" if context else ""
            print(f"::error{ctx}::{full}", flush=True)
        else:
            print(f"[ERROR] {full}", file=sys.stderr, flush=True)
        if exc:
            traceback.print_exc(file=sys.stderr)

    # ------------------------------------------------------------------
    # Summary & exit
    # ------------------------------------------------------------------

    def summary(self) -> int:
        """
        Print a final summary to stderr.
        Returns 1 if any errors were recorded, else 0.
        """
        print("", file=sys.stderr)  # blank separator
        if self._warnings:
            print(
                f"[WARN]  {len(self._warnings)} warning(s) in {self._name}:",
                file=sys.stderr,
            )
            for w in self._warnings:
                print(f"        - {w}", file=sys.stderr)

        if self._errors:
            print(
                f"[ERROR] {len(self._errors)} error(s) in {self._name}:",
                file=sys.stderr,
            )
            for ctx, msg in self._errors:
                print(f"        [{ctx}] {msg}", file=sys.stderr)
            print(
                f"[ERROR] {self._name} finished with errors — see above.",
                file=sys.stderr,
            )
            return 1

        if self._warnings:
            print(f"[INFO]  {self._name} finished with warnings.", file=sys.stderr)
        else:
            print(f"[INFO]  {self._name} finished successfully.", file=sys.stderr)
        return 0
