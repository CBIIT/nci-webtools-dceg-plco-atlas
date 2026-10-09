#!/usr/bin/env python3
"""Generate local/db-init/03-participant-seed.sql: synthetic participant data so
the GWAS Explorer "Phenotype Characteristics" charts render locally.

For each associatable (leaf) phenotype it seeds:
  - a phenotype_metadata row (sex/ancestry/chromosome = 'all')
  - participant_data rows (case/control value + age) against a shared
    synthetic participant pool

Leaf phenotypes are forced to type 'binary' (the most reliable chart path);
this is synthetic local data, not the real PLCO results.
"""
import csv
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, "..", "database", "import", "phenotype.csv")
OUT_PATH = os.path.join(HERE, "db-init", "03-participant-seed.sql")

N_PARTICIPANTS = 200
ANCESTRIES = ["white", "white", "white", "black", "hispanic", "asian",
              "pacific_islander", "american_indian"]
random.seed(42)


def leaf_ids():
    ids = []
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)
        for r in reader:
            if not r or not r[0].strip():
                continue
            assoc = (r[3].strip() if len(r) > 3 else "")
            if assoc and assoc.upper() != "NULL":   # has an association name => leaf
                ids.append(int(r[0].strip()))
    return ids


def main():
    ids = leaf_ids()
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as out:
        out.write("USE plcogwas;\n")
        out.write("SET FOREIGN_KEY_CHECKS=0;\n")
        out.write("TRUNCATE TABLE participant_data;\n")
        out.write("TRUNCATE TABLE participant;\n")
        out.write("TRUNCATE TABLE phenotype_metadata;\n")
        # Use the binary chart path and ensure an age column name exists.
        out.write("UPDATE phenotype SET type='binary', "
                  "age_name=COALESCE(age_name,'age_co') WHERE name IS NOT NULL;\n")

        # participant pool
        participants = []
        rows = []
        for pid in range(1, N_PARTICIPANTS + 1):
            sex = "female" if random.random() < 0.52 else "male"
            ancestry = random.choice(ANCESTRIES)
            participants.append((pid, sex, ancestry))
            rows.append(f"({pid}, 'PLCO{pid:05d}', '{sex}', '{ancestry}')")
        out.write("INSERT INTO participant (id, plco_id, sex, ancestry) VALUES\n  "
                  + ",\n  ".join(rows) + ";\n")

        # per-phenotype metadata + participant_data
        meta_rows = []
        data_buf = []
        data_id = 1

        def flush():
            nonlocal data_buf
            if data_buf:
                out.write("INSERT INTO participant_data (id, phenotype_id, participant_id, value, age) VALUES\n  "
                          + ",\n  ".join(data_buf) + ";\n")
                data_buf = []

        for pid in ids:
            prevalence = 0.2 + (pid % 5) * 0.08
            cases = 0
            for (part_id, sex, ancestry) in participants:
                value = 1 if random.random() < prevalence else 0
                cases += value
                age = random.randint(55, 79)
                data_buf.append(f"({data_id}, {pid}, {part_id}, {value}, {age})")
                data_id += 1
                if len(data_buf) >= 500:
                    flush()
            controls = N_PARTICIPANTS - cases
            meta_rows.append(
                f"({pid}, 'all', 'all', 'all', 1.0, 0.5, 0.5, {N_PARTICIPANTS}, "
                f"{N_PARTICIPANTS}, {cases}, {controls})"
            )
        flush()

        out.write(
            "INSERT INTO phenotype_metadata "
            "(phenotype_id, sex, ancestry, chromosome, lambda_gc, average_value, standard_deviation, "
            "count, participant_count, participant_count_case, participant_count_control) VALUES\n  "
            + ",\n  ".join(meta_rows) + ";\n"
        )
        out.write("SET FOREIGN_KEY_CHECKS=1;\n")

    print(f"Wrote {len(ids)} phenotypes x {N_PARTICIPANTS} participants "
          f"(~{len(ids) * N_PARTICIPANTS} participant_data rows) to {OUT_PATH}")


if __name__ == "__main__":
    main()
