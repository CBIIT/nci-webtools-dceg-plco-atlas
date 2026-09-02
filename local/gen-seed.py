#!/usr/bin/env python3
"""Generate local/db-init/02-seed-phenotype.sql from the repo's phenotype seed CSV.

Mirrors the column mapping in database/import/import-phenotype.js:
  CSV: Phenotype ID, Phenotype Parent ID, Display Name, Association Name,
       Description (Definition), Phenotype Data Type, Age, Sex Specific
  ->   id, parent_id, display_name, name, description, type, age_name, sex_specific
"""
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, "..", "database", "import", "phenotype.csv")
OUT_PATH = os.path.join(HERE, "db-init", "02-seed-phenotype.sql")

TYPES = {"binary", "categorical", "continuous"}
SEXES = {"female", "male"}


def norm(v):
    v = (v or "").strip()
    if v == "" or v.upper() == "NULL":
        return None
    return v


def sql(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"


def main():
    rows = []
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)  # header
        for r in reader:
            if not r or not norm(r[0]):
                continue
            pid = norm(r[0])
            parent = norm(r[1]) if len(r) > 1 else None
            display_name = norm(r[2]) if len(r) > 2 else None
            name = norm(r[3]) if len(r) > 3 else None
            description = norm(r[4]) if len(r) > 4 else None
            ptype = norm(r[5]) if len(r) > 5 else None
            age_name = norm(r[6]) if len(r) > 6 else None
            sex = norm(r[7]) if len(r) > 7 else None

            if ptype == "ordinal":
                ptype = "categorical"
            if ptype not in TYPES:
                ptype = None
            if sex not in SEXES:
                sex = None

            rows.append((int(pid), int(parent) if parent else None, name,
                         age_name, display_name, description, ptype, sex))

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as out:
        out.write("USE plcogwas;\n")
        out.write("SET FOREIGN_KEY_CHECKS=0;\n")
        out.write("TRUNCATE TABLE phenotype;\n")
        for (pid, parent, name, age_name, display_name, description, ptype, sex) in rows:
            # The phenotype tree (phenotypes-form.js) only shows nodes that have
            # an import_date (or a descendant leaf that does), and only allows
            # selecting nodes with a participant_count. Mark the associatable
            # (leaf) phenotypes -- those with a real `name` -- as "imported" so
            # the tree is visible and searchable locally. Parent categories
            # become visible via their descendants.
            imported = name is not None
            import_date = "'2024-01-01 00:00:00'" if imported else "NULL"
            participant_count = "10000" if imported else "NULL"
            import_count = "1000000" if imported else "NULL"
            out.write(
                "INSERT INTO phenotype "
                "(id, parent_id, name, age_name, display_name, description, type, sex_specific, "
                "import_date, participant_count, import_count) VALUES "
                f"({pid}, {parent if parent is not None else 'NULL'}, "
                f"{sql(name)}, {sql(age_name)}, {sql(display_name)}, {sql(description)}, "
                f"{sql(ptype)}, {sql(sex)}, {import_date}, {participant_count}, {import_count});\n"
            )
        out.write("SET FOREIGN_KEY_CHECKS=1;\n")
    print(f"Wrote {len(rows)} phenotype rows to {OUT_PATH}")


if __name__ == "__main__":
    main()
