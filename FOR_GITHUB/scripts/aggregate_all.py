"""
Aggregate all individual question JSON files into a single questions.json
for the frontend, and update metadata.json.
"""
from __future__ import annotations
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
Q_DIR = ROOT / "Questions JSON files"
OUT_DIR = ROOT / "app" / "public" / "data"

MONTH_ORDER = {"January": 1, "May": 5, "September": 9}


def sort_key(r):
    attempt = r.get("attempt") or ""
    parts = attempt.split()
    yr = int(parts[-1]) if parts and parts[-1].isdigit() else 0
    mo = MONTH_ORDER.get(parts[0], 0) if parts else 0
    return (yr, mo, r.get("paper_number", 0), r.get("question_number", 0), r.get("question_part") or "")


def main():
    # Load all JSON files
    all_records = []
    errors = []
    for p in sorted(Q_DIR.glob("*.json")):
        try:
            rec = json.loads(p.read_text(encoding="utf-8"))
            all_records.append(rec)
        except Exception as e:
            errors.append(f"{p.name}: {e}")

    print(f"Loaded {len(all_records)} records, {len(errors)} errors")

    # Sort
    all_records.sort(key=sort_key)

    # Backup legacy if not exists
    legacy = OUT_DIR / "questions.legacy.json"
    current = OUT_DIR / "questions.json"
    if current.exists() and not legacy.exists():
        legacy.write_text(current.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"Backed up legacy to {legacy}")

    # Write aggregated
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    current.write_text(json.dumps(all_records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(all_records)} records to {current}")

    # Update metadata
    attempts = sorted(set(r.get("attempt") for r in all_records if r.get("attempt")))
    papers = sorted(set(r.get("paper_number") for r in all_records if r.get("paper_number")))
    sources = sorted(set(r.get("metadata", {}).get("source", r.get("source", "")) for r in all_records if r.get("metadata", {}).get("source") or r.get("source")))

    metadata = {
        "schema_version": 2,
        "source_catalog": "Question-Answer main data",
        "authoritative_document_type": "unified",
        "question_count": len(all_records),
        "attempts": attempts,
        "papers": papers,
        "sources": sources,
    }
    meta_path = OUT_DIR / "metadata.json"
    meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated metadata: {json.dumps(metadata, indent=2)}")

    # Stats
    by_source = {}
    for r in all_records:
        src = r.get("metadata", {}).get("source", r.get("source", "unknown"))
        by_source[src] = by_source.get(src, 0) + 1
    print("\nBy source:")
    for src, count in sorted(by_source.items()):
        print(f"  {src}: {count}")

    by_attempt = {}
    for r in all_records:
        att = r.get("attempt", "unknown")
        by_attempt[att] = by_attempt.get(att, 0) + 1
    print("\nBy attempt:")
    for att, count in sorted(by_attempt.items()):
        print(f"  {att}: {count}")

    by_paper = {}
    for r in all_records:
        p = r.get("paper_number", 0)
        by_paper[p] = by_paper.get(p, 0) + 1
    print("\nBy paper:")
    for p, count in sorted(by_paper.items()):
        print(f"  Paper {p}: {count}")


if __name__ == "__main__":
    main()
