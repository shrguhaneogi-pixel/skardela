# Skardela Open Puzzle Exchange Specification

This document defines the schema, validation rules, and architectural boundaries for the Skardela Open Puzzle Exchange (`format: "skardela-pack-v1"`).

## 1. Design Principles

- **Zero-Backend & Local-First**: Import and export operations execute entirely in the user's web browser.
- **Safety First**: No arbitrary code execution. All imported data is strictly parsed as inert JSON and validated against strict schemas and backtracking solvers.
- **Explicit Licensing**: All packs require open metadata (CC-BY-4.0 recommended) to protect creators and players.

## 2. Pack Schema (`skardela-pack-v1`)

A valid puzzle pack is a JSON document matching this structure:

```json
{
  "format": "skardela-pack-v1",
  "id": "pack-sample-01",
  "title": "Beginner Binary Pack",
  "author": "Skardela Community",
  "version": "1.0.0",
  "license": "CC-BY-4.0",
  "description": "A collection of curated 4x4 Colour Binary logic challenges.",
  "puzzles": [
    {
      "id": "colour-binary-9101",
      "type": "colour-binary",
      "difficulty": "easy",
      "author": "Skardela Community",
      "license": "CC-BY-4.0",
      "start": ["R..R", "R.BR", "..RB", "..R."],
      "answer": ["RBBR", "RBBR", "BRRB", "BRRB"]
    }
  ]
}
```

## 3. Boundary Validation Rules

1. **Size Limits**: Maximum pack file size is 256 KB.
2. **Puzzle Count**: Maximum 50 puzzles per pack to ensure instant parsing and responsive UI.
3. **Solver Verification**: Every puzzle inside the pack must pass universal `validatePuzzle()` checks (unique solution for Colour Binary; valid crosswords for Guzzle).
4. **Sanitization**: Prototype keys (`__proto__`, `constructor`) are rejected during schema validation.

## 4. Architectural Boundaries and Infrastructure Requirements

Skardela does **not** provide a centralized public upload server, cloud database, or community ranking service in this client-side release.

To build a genuinely shared, multi-tenant public puzzle catalog in the future, the following backend infrastructure would be required:

- **Authentication & Reputation Service**: User accounts with email verification, rate limiting, and spam protection.
- **Object Storage**: S3-compatible content-addressable storage for validated `.skardela.json` packs.
- **Automated Ingestion Queue**: Sandboxed worker jobs running the solver verification suite prior to catalog indexing.
- **Moderation & DMCA Enforcement**: Content moderation tools, abuse reporting workflows, and copyright takedown handling.
- **Public Query API**: Read-only CDN-cached endpoint for catalog searching, tagging, and downloading.
