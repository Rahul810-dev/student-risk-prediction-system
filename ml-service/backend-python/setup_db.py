import psycopg2
import hashlib

DB_CONFIG = {
    "host"    : "localhost",
    "database": "myapp",
    "user"    : "postgres",
    "password": "978754",
    "port"    : "5432"
}

conn   = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

TEACHERS = [
    ('Dr. Arjun Sharma',   'EMP001', 'arjun.sharma@college.edu',   'Associate Professor'),
    ('Mr. Raj Kumar',      'EMP002', 'raj.kumar@college.edu',      'Assistant Professor'),
    ('Ms. Priya Nair',     'EMP003', 'priya.nair@college.edu',     'Assistant Professor'),
    ('Mr. Suresh Babu',    'EMP004', 'suresh.babu@college.edu',    'Assistant Professor'),
    ('Ms. Kavitha R',      'EMP005', 'kavitha.r@college.edu',      'Assistant Professor'),
    ('Mr. Ramesh Kumar',   'EMP006', 'ramesh.kumar@college.edu',   'Associate Professor'),
    ('Ms. Deepa M',        'EMP007', 'deepa.m@college.edu',        'Assistant Professor'),
    ('Mr. Karthik S',      'EMP008', 'karthik.s@college.edu',      'Assistant Professor'),
    ('Ms. Anitha V',       'EMP009', 'anitha.v@college.edu',       'Assistant Professor'),
    ('Mr. Senthil Kumar',  'EMP010', 'senthil.kumar@college.edu',  'Assistant Professor'),
    ('Ms. Lakshmi P',      'EMP011', 'lakshmi.p@college.edu',      'Assistant Professor'),
    ('Mr. Vijay R',        'EMP012', 'vijay.r@college.edu',        'Associate Professor'),
    ('Ms. Meena S',        'EMP013', 'meena.s@college.edu',        'Assistant Professor'),
    ('Mr. Ganesh T',       'EMP014', 'ganesh.t@college.edu',       'Assistant Professor'),
    ('Ms. Shanthi B',      'EMP015', 'shanthi.b@college.edu',      'Assistant Professor'),
    ('Mr. Murugan K',      'EMP016', 'murugan.k@college.edu',      'Assistant Professor'),
    ('Ms. Saranya D',      'EMP017', 'saranya.d@college.edu',      'Assistant Professor'),
    ('Mr. Prakash N',      'EMP018', 'prakash.n@college.edu',      'Associate Professor'),
    ('Ms. Revathi M',      'EMP019', 'revathi.m@college.edu',      'Assistant Professor'),
    ('Mr. Chandran A',     'EMP020', 'chandran.a@college.edu',     'Assistant Professor'),
]

for name, emp_id, email, designation in TEACHERS:
    cursor.execute("""
        INSERT INTO teachers (teacher_name, employee_id, email, department, designation)
        VALUES (%s, %s, %s, 'CSE', %s)
        ON CONFLICT (employee_id) DO NOTHING
    """, (name, emp_id, email, designation))

conn.commit()
print("Teachers inserted")

cursor.execute("SELECT id FROM teachers ORDER BY id ASC")
teacher_ids = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT student_id FROM students ORDER BY student_id ASC")
student_ids = [row[0] for row in cursor.fetchall()]

STUDENTS_PER_TEACHER = 50
for i, student_id in enumerate(student_ids):
    teacher_idx = min(i // STUDENTS_PER_TEACHER, len(teacher_ids) - 1)
    cursor.execute(
        "UPDATE students SET teacher_id = %s WHERE student_id = %s",
        (teacher_ids[teacher_idx], student_id)
    )

conn.commit()
print(f"Assigned {len(student_ids)} students to {len(teacher_ids)} teachers")

cursor.execute("SELECT student_id, student_name, email FROM students")
for student_id, student_name, email in cursor.fetchall():
    if not email:
        email = f"{student_id.lower()}@college.edu"
    try:
        cursor.execute("""
            INSERT INTO users (name, email, role, password_hash, student_id)
            VALUES (%s, %s, 'Student', %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, (student_name, email, hash_password(student_id), student_id))
    except Exception as e:
        print(f"Student error {student_id}: {e}")

conn.commit()
print("Student users created — password is their roll number")

cursor.execute("SELECT teacher_name, email, employee_id FROM teachers")
for teacher_name, email, employee_id in cursor.fetchall():
    try:
        cursor.execute("""
            INSERT INTO users (name, email, role, password_hash, employee_id)
            VALUES (%s, %s, 'Staff', %s, %s)
            ON CONFLICT (email) DO NOTHING
        """, (teacher_name, email, hash_password('TEACH@2024'), employee_id))
    except Exception as e:
        print(f"Teacher error {employee_id}: {e}")

conn.commit()
print("Teacher users created — password is TEACH@2024")

try:
    cursor.execute("""
        INSERT INTO users (name, email, role, password_hash)
        VALUES ('Admin User', 'admin@college.edu', 'Admin', %s)
        ON CONFLICT (email) DO NOTHING
    """, (hash_password('ADMIN@2024'),))
    conn.commit()
    print("Admin created — password is ADMIN@2024")
except Exception as e:
    print(f"Admin error: {e}")

cursor.close()
conn.close()

print("\nSetup complete. Credentials:")
print("Admin   : admin@college.edu       / ADMIN@2024")
print("Teacher : arjun.sharma@college.edu / TEACH@2024")
print("Student : use their email from DB  / their roll number e.g. CSE20260001")