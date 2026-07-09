import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "database": "myapp",
    "user": "postgres",
    "password": "978754",
    "port": "5432"
}

# Target split per your pending notes doc
DEPT_SPLIT = [
    ("CSE", 300),
    ("IT", 200),
    ("ME", 150),
    ("ECE", 350),
]

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def migrate():
    conn = get_conn()
    cursor = conn.cursor()

    # Get all student_ids in stable order
    cursor.execute("SELECT student_id FROM students ORDER BY student_id ASC")
    all_ids = [row[0] for row in cursor.fetchall()]

    total_expected = sum(count for _, count in DEPT_SPLIT)
    if len(all_ids) != total_expected:
        print(f"WARNING: {len(all_ids)} students in DB but split totals {total_expected}. Aborting.")
        cursor.close()
        conn.close()
        return

    # Assign department in contiguous blocks
    idx = 0
    dept_assignments = {}  # dept -> list of student_ids
    for dept, count in DEPT_SPLIT:
        block = all_ids[idx:idx + count]
        dept_assignments[dept] = block
        idx += count

    for dept, ids in dept_assignments.items():
        cursor.execute(
            "UPDATE students SET department = %s WHERE student_id = ANY(%s)",
            (dept, ids)
        )
        print(f"Updated {cursor.rowcount} students to department {dept}")

    conn.commit()

    # Now split the 20 teachers proportionally across departments
    # 300/200/150/350 out of 1000 -> roughly 6/4/3/7 teachers (50 students each)
    cursor.execute("SELECT id FROM teachers ORDER BY id ASC")
    teacher_ids = [row[0] for row in cursor.fetchall()]

    teacher_counts = {"CSE": 6, "IT": 4, "ME": 3, "ECE": 7}  # sums to 20
    t_idx = 0
    teacher_dept_map = {}
    for dept, count in teacher_counts.items():
        for _ in range(count):
            teacher_dept_map[teacher_ids[t_idx]] = dept
            t_idx += 1

    for tid, dept in teacher_dept_map.items():
        cursor.execute("UPDATE teachers SET department = %s WHERE id = %s", (dept, tid))

    conn.commit()
    print("Teacher department reassignment complete.")

    # Reassign each student's teacher_id to a teacher from their OWN new department
    for dept, student_ids in dept_assignments.items():
        dept_teacher_ids = [tid for tid, d in teacher_dept_map.items() if d == dept]
        if not dept_teacher_ids:
            print(f"WARNING: no teachers assigned to {dept}, students left without a mentor.")
            continue
        for i, sid in enumerate(student_ids):
            teacher_id = dept_teacher_ids[i % len(dept_teacher_ids)]
            cursor.execute(
                "UPDATE students SET teacher_id = %s WHERE student_id = %s",
                (teacher_id, sid)
            )
        print(f"Reassigned {len(student_ids)} {dept} students across {len(dept_teacher_ids)} teachers")

    conn.commit()
    cursor.close()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()