import pickle
import psycopg2
import requests
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

DB_CONFIG = {
    "host": "localhost",
    "database": "myapp",
    "user": "postgres",
    "password": "978754",
    "port": "5432"
}

API_URL = "http://localhost:8000/save_prediction"
MODEL_PATH = "models/dropout_multi_model.pkl"

with open(MODEL_PATH, "rb") as f:
    models = pickle.load(f)

overall_model    = models["overall_model"]
cgpa_model       = models["cgpa_model"]
backlog_model    = models["backlog_model"]
assignment_model = models["assignment_model"]
attendance_model = models["attendance_model"]
model_accuracy   = models["overall_accuracy"]

conn   = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

cursor.execute("""
    SELECT
        student_id,
        semester,
        cgpa_current,
        gpa_previous,
        backlogs,
        attendance_percent,
        consecutive_absences
    FROM students
    ORDER BY student_id ASC
""")

students = cursor.fetchall()

FEATURE_COLS = ['gpa_current', 'gpa_previous', 'backlogs', 'attendance', 'absences']

success = 0
failed  = 0

for row in students:

    student_id, semester, cgpa_current, gpa_previous, \
    backlogs, attendance_percent, consecutive_absences = row

    features = pd.DataFrame([[
        float(cgpa_current         or 0),
        float(gpa_previous         or 0),
        float(backlogs             or 0),
        float(attendance_percent   or 0),
        float(consecutive_absences or 0)
    ]], columns=FEATURE_COLS)

    try:
        cgpa_risk       = float(cgpa_model.predict_proba(features)[0][1])
        backlog_risk    = float(backlog_model.predict_proba(features)[0][1])
        assignment_risk = float(assignment_model.predict_proba(features)[0][1])
        attendance_risk = float(attendance_model.predict_proba(features)[0][1])

        overall_risk    = round(
            (cgpa_risk    * 0.30) +
            (backlog_risk * 0.25) +
            (assignment_risk * 0.20) +
            (attendance_risk * 0.25),
        4)

        payload = {
            "student_id"                  : student_id,
            "semester"                    : int(semester),
            "overall_risk_probability"    : overall_risk,
            "cgpa_risk_probability"       : round(cgpa_risk,       4),
            "backlog_risk_probability"    : round(backlog_risk,     4),
            "assignment_risk_probability" : round(assignment_risk,  4),
            "attendance_risk_probability" : round(attendance_risk,  4),
            "model_accuracy"              : round(float(model_accuracy), 4)
        }

        response = requests.post(API_URL, json=payload)

        if response.status_code == 200:
            success += 1
            print(f"{student_id} | sem {semester} | overall: {overall_risk:.2%} | attendance: {attendance_risk:.2%}")
        else:
            failed += 1
            print(f"FAILED {student_id} | {response.status_code} | {response.text}")

    except Exception as e:
        failed += 1
        print(f"ERROR {student_id} | {e}")

cursor.close()
conn.close()

print(f"Success: {success} | Failed: {failed}")