"""Reproduce the Institute's two-release O*NET Speaking comparison.

Download the two ZIP files from SOURCES into one folder, then run:
  python3 reproduce.py path/to/archives path/to/output

Requires only Python 3.8+ and its standard library.
"""
import argparse
import csv
import hashlib
import io
import json
import statistics
import zipfile
from pathlib import Path

SOURCES = {
    "15": ("db_15_0.zip", "db_15_0", "Skills.txt",
           "https://www.onetcenter.org/dl_files/db_15_0.zip",
           "7f460ad768adff84109139cd1b54b72721b8c73bad5f154285a477bc9b2673fe"),
    "31": ("db_31_0_text.zip", "db_31_0_text", "Essential Skills.txt",
           "https://www.onetcenter.org/dl_files/database/db_31_0_text.zip",
           "6883548adf5fde64cf6f801b35d15519c9225f2732c3cab0e281c652d16b23a9")
}


def table(archive, filename):
    with archive.open(filename) as stream:
        yield from csv.DictReader(io.TextIOWrapper(stream, encoding="latin-1"), delimiter="\t")


def occupations(folder, source):
    filename, prefix, skills_file, _, checksum = source
    path = folder / filename
    if hashlib.sha256(path.read_bytes()).hexdigest() != checksum:
        raise ValueError("Unexpected archive checksum: " + filename)
    with zipfile.ZipFile(path) as archive:
        metadata = {r["O*NET-SOC Code"]: r for r in table(archive, prefix + "/Occupation Data.txt")}
        ratings = {}
        for row in table(archive, prefix + "/" + skills_file):
            if row["Element ID"] != "2.A.1.d" or row["Element Name"] != "Speaking":
                continue
            if row["Domain Source"] != "Analyst" or row["Recommend Suppress"] != "N":
                continue
            scale = row["Scale ID"]
            if scale not in ("IM", "LV") or row["Not Relevant"] == "Y":
                continue
            job = ratings.setdefault(row["O*NET-SOC Code"], {})
            if scale in job:
                raise ValueError("Duplicate occupation and scale")
            job[scale] = (float(row["Data Value"]), row["Date"])
    return {code: (metadata[code], values) for code, values in ratings.items() if "IM" in values and "LV" in values}


def normalized(text):
    return " ".join(text.casefold().split())


def change_summary(rows):
    summary = {}
    for measure in ("importance", "level"):
        differences = [r[measure + "_change"] for r in rows]
        summary[measure] = {
            "mean_change": round(statistics.mean(differences), 4),
            "median_change": statistics.median(differences),
            "higher": sum(x > 0 for x in differences),
            "unchanged": differences.count(0),
            "lower": sum(x < 0 for x in differences),
        }
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archives", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    old = occupations(args.archives, SOURCES["15"])
    new = occupations(args.archives, SOURCES["31"])
    shared = sorted(old.keys() & new.keys())
    titles = [c for c in shared if normalized(old[c][0]["Title"]) == normalized(new[c][0]["Title"])]
    matched = [c for c in titles if normalized(old[c][0]["Description"]) == normalized(new[c][0]["Description"])]
    rows = []
    for code in matched:
        old_values, new_values = old[code][1], new[code][1]
        row = {"occupation_code": code, "occupation_title": new[code][0]["Title"]}
        for key, values in (("15", old_values), ("31", new_values)):
            if values["IM"][1] != values["LV"][1]:
                raise ValueError("Scale observation dates differ for " + code)
            row["rating_date_" + key] = values["IM"][1]
        for scale, label in (("IM", "importance"), ("LV", "level")):
            before, after = old_values[scale][0], new_values[scale][0]
            row[label + "_15"], row[label + "_31"] = before, after
            row[label + "_change"] = round(after - before, 2)
        rows.append(row)
    rerated = [r for r in rows if r["rating_date_15"] != r["rating_date_31"]]
    args.output.mkdir(exist_ok=True, parents=True)
    with (args.output / "matched-occupations.csv").open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    summary = {
        "source_archives": {k: {"url": v[3], "sha256": v[4]} for k, v in SOURCES.items()},
        "source_credit": "O*NET 15.0 and 31.0 Databases, USDOL/ETA; matched and compared by Wellspoken Institute. USDOL/ETA has not approved, endorsed, or tested the modifications.",
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "eligible_15": len(old), "eligible_31": len(new), "same_code": len(shared),
        "same_code_and_title": len(titles), "same_code_title_definition": len(rows),
        "newer_rating_date": len(rerated), "all_matches": change_summary(rows),
        "newer_rating_date_only": change_summary(rerated)
    }
    (args.output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
