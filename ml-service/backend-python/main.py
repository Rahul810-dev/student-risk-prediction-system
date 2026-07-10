from fastapi import FastAPI, Query
from pydantic import BaseModel
import psycopg2
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import os
import io
import pandas as pd
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": "localhost",
    "database": "myapp",
    "user": "postgres",
    "password": "978754",
    "port": "5432"
}

def get_conn():
    return psycopg2.connect(**DB_CONFIG)


class RiskPrediction(BaseModel):
    student_id: str
    semester: int
    overall_risk_probability: float
    cgpa_risk_probability: float
    backlog_risk_probability: float
    assignment_risk_probability: float
    attendance_risk_probability: float
    model_accuracy: float


@app.post("/save_prediction")
def save_prediction(data: RiskPrediction):
    conn = get_conn()
    cursor = conn.cursor()

    query = """
        INSERT INTO risk_prediction(
            student_id, semester,
            overall_risk_probability, cgpa_risk_probability,
            backlog_risk_probability, assignment_risk_probability,
            attendance_risk_probability, model_accuracy
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data.student_id, str(data.semester),
        data.overall_risk_probability, data.cgpa_risk_probability,
        data.backlog_risk_probability, data.assignment_risk_probability,
        data.attendance_risk_probability, data.model_accuracy
    )

    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"Prediction saved for {data.student_id} semester {data.semester}"}


@app.get("/students/all")
def get_all_students():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department,
            s.section, s.year, s.semester,
            s.cgpa_current, s.gpa_previous,
            s.backlogs, s.attendance_percent,
            s.consecutive_absences, s.phone_number, s.email,
            r.overall_risk_probability, r.cgpa_risk_probability,
            r.backlog_risk_probability, r.assignment_risk_probability,
            r.attendance_risk_probability, r.prediction_date
        FROM students s
        LEFT JOIN risk_prediction r
            ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date)
                FROM risk_prediction
                WHERE student_id = s.student_id
            )
        ORDER BY s.student_id ASC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "student_id"                  : row[0],
            "student_name"                : row[1],
            "department"                  : row[2],
            "section"                     : row[3],
            "year"                        : row[4],
            "semester"                    : row[5],
            "cgpa_current"                : float(row[6]) if row[6] else 0,
            "gpa_previous"                : float(row[7]) if row[7] else 0,
            "backlogs"                    : row[8] or 0,
            "attendance_percent"          : float(row[9]) if row[9] else 0,
            "consecutive_absences"        : row[10] or 0,
            "phone_number"                : row[11],
            "email"                       : row[12],
            "overall_risk_probability"    : float(row[13]) if row[13] else 0,
            "cgpa_risk_probability"       : float(row[14]) if row[14] else 0,
            "backlog_risk_probability"    : float(row[15]) if row[15] else 0,
            "assignment_risk_probability" : float(row[16]) if row[16] else 0,
            "attendance_risk_probability" : float(row[17]) if row[17] else 0,
            "prediction_date"             : str(row[18]) if row[18] else None
        }
        for row in rows
    ]


@app.get("/students/search")
def search_student(query: str = Query(..., description="Student name or roll number")):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department, s.section,
            s.year, s.semester, s.cgpa_current, s.gpa_previous,
            s.backlogs, s.attendance_percent, s.consecutive_absences,
            s.phone_number, s.email,
            r.overall_risk_probability, r.cgpa_risk_probability,
            r.backlog_risk_probability, r.assignment_risk_probability,
            r.attendance_risk_probability, r.model_accuracy, r.prediction_date
        FROM students s
        LEFT JOIN risk_prediction r
            ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date)
                FROM risk_prediction
                WHERE student_id = s.student_id
            )
        WHERE
            s.student_id ILIKE %s
            OR s.student_name ILIKE %s
        ORDER BY s.student_id ASC
    """, (f"%{query}%", f"%{query}%"))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"error": f"No student found for query: {query}"}

    return [
        {
            "student_id"                  : row[0],
            "student_name"                : row[1],
            "department"                  : row[2],
            "section"                     : row[3],
            "year"                        : row[4],
            "semester"                    : row[5],
            "cgpa_current"                : float(row[6]) if row[6] else None,
            "gpa_previous"                : float(row[7]) if row[7] else None,
            "backlogs"                    : row[8],
            "attendance_percent"          : float(row[9]) if row[9] else None,
            "consecutive_absences"        : row[10],
            "phone_number"                : row[11],
            "email"                       : row[12],
            "overall_risk_probability"    : float(row[13]) if row[13] else None,
            "cgpa_risk_probability"       : float(row[14]) if row[14] else None,
            "backlog_risk_probability"    : float(row[15]) if row[15] else None,
            "assignment_risk_probability" : float(row[16]) if row[16] else None,
            "attendance_risk_probability" : float(row[17]) if row[17] else None,
            "model_accuracy"              : float(row[18]) if row[18] else None,
            "prediction_date"             : str(row[19]) if row[19] else None
        }
        for row in rows
    ]


@app.get("/students/academic")
def get_academic_performance(query: str = Query(..., description="Student name or roll number")):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department,
            s.section, s.semester, s.cgpa_current,
            s.gpa_previous, s.backlogs, s.attendance_percent
        FROM students s
        WHERE
            s.student_id ILIKE %s
            OR s.student_name ILIKE %s
        ORDER BY s.student_id ASC
    """, (f"%{query}%", f"%{query}%"))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"error": f"No student found for query: {query}"}

    return [
        {
            "student_id"         : row[0],
            "student_name"       : row[1],
            "department"         : row[2],
            "section"            : row[3],
            "semester"           : row[4],
            "cgpa_current"       : float(row[5]) if row[5] else None,
            "gpa_previous"       : float(row[6]) if row[6] else None,
            "backlogs"           : row[7],
            "attendance_percent" : float(row[8]) if row[8] else None
        }
        for row in rows
    ]


@app.get("/students/high_risk")
def get_high_risk_students(threshold: float = Query(0.5, description="Risk threshold between 0 and 1")):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department,
            s.section, s.semester,
            r.overall_risk_probability, r.cgpa_risk_probability,
            r.backlog_risk_probability, r.assignment_risk_probability,
            r.attendance_risk_probability, r.prediction_date
        FROM students s
        JOIN risk_prediction r
            ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date)
                FROM risk_prediction
                WHERE student_id = s.student_id
            )
        WHERE r.overall_risk_probability >= %s
        ORDER BY r.overall_risk_probability DESC
    """, (threshold,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"message": f"No students found above risk threshold {threshold}"}

    return [
        {
            "student_id"                  : row[0],
            "student_name"                : row[1],
            "department"                  : row[2],
            "section"                     : row[3],
            "semester"                    : row[4],
            "overall_risk_probability"    : float(row[5]),
            "cgpa_risk_probability"       : float(row[6]),
            "backlog_risk_probability"    : float(row[7]),
            "assignment_risk_probability" : float(row[8]),
            "attendance_risk_probability" : float(row[9]),
            "prediction_date"             : str(row[10])
        }
        for row in rows
    ]


@app.get("/students/department/{department}")
def get_by_department(department: str):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department,
            s.section, s.semester, s.cgpa_current,
            r.overall_risk_probability, r.attendance_risk_probability,
            r.cgpa_risk_probability, r.prediction_date
        FROM students s
        JOIN risk_prediction r
            ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date)
                FROM risk_prediction
                WHERE student_id = s.student_id
            )
        WHERE s.department ILIKE %s
        ORDER BY r.overall_risk_probability DESC
    """, (f"%{department}%",))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"error": f"No students found for department: {department}"}

    return [
        {
            "student_id"               : row[0],
            "student_name"             : row[1],
            "department"               : row[2],
            "section"                  : row[3],
            "semester"                 : row[4],
            "cgpa_current"             : float(row[5]) if row[5] else None,
            "overall_risk_probability" : float(row[6]),
            "attendance_risk"          : float(row[7]),
            "cgpa_risk"                : float(row[8]),
            "prediction_date"          : str(row[9])
        }
        for row in rows
    ]


@app.get("/students/semester/{semester}")
def get_by_semester(semester: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.department,
            s.section, s.semester, s.cgpa_current,
            r.overall_risk_probability, r.attendance_risk_probability,
            r.cgpa_risk_probability, r.prediction_date
        FROM students s
        JOIN risk_prediction r
            ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date)
                FROM risk_prediction
                WHERE student_id = s.student_id
            )
        WHERE s.semester = %s
        ORDER BY r.overall_risk_probability DESC
    """, (semester,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"error": f"No students found for semester: {semester}"}

    return [
        {
            "student_id"               : row[0],
            "student_name"             : row[1],
            "department"               : row[2],
            "section"                  : row[3],
            "semester"                 : row[4],
            "cgpa_current"             : float(row[5]) if row[5] else None,
            "overall_risk_probability" : float(row[6]),
            "attendance_risk"          : float(row[7]),
            "cgpa_risk"                : float(row[8]),
            "prediction_date"          : str(row[9])
        }
        for row in rows
    ]


@app.get("/prediction/{id}")
def get_prediction(id: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id, student_id, semester,
            overall_risk_probability, cgpa_risk_probability,
            backlog_risk_probability, assignment_risk_probability,
            attendance_risk_probability, model_accuracy, prediction_date
        FROM risk_prediction
        WHERE id = %s
    """, (id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row is None:
        return {"error": f"No prediction found for id {id}"}

    return {
        "id"                          : row[0],
        "student_id"                  : row[1],
        "semester"                    : row[2],
        "overall_risk_probability"    : float(row[3]),
        "cgpa_risk_probability"       : float(row[4]),
        "backlog_risk_probability"    : float(row[5]),
        "assignment_risk_probability" : float(row[6]),
        "attendance_risk_probability" : float(row[7]),
        "model_accuracy"              : float(row[8]),
        "prediction_date"             : str(row[9])
    }


@app.get("/prediction/student/{student_id}")
def get_prediction_by_student(student_id: str):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id, student_id, semester,
            overall_risk_probability, cgpa_risk_probability,
            backlog_risk_probability, assignment_risk_probability,
            attendance_risk_probability, model_accuracy, prediction_date
        FROM risk_prediction
        WHERE student_id = %s
        ORDER BY prediction_date DESC
    """, (student_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {"error": f"No predictions found for student {student_id}"}

    return [
        {
            "id"                          : row[0],
            "student_id"                  : row[1],
            "semester"                    : row[2],
            "overall_risk_probability"    : float(row[3]),
            "cgpa_risk_probability"       : float(row[4]),
            "backlog_risk_probability"    : float(row[5]),
            "assignment_risk_probability" : float(row[6]),
            "attendance_risk_probability" : float(row[7]),
            "model_accuracy"              : float(row[8]),
            "prediction_date"             : str(row[9])
        }
        for row in rows
    ]   


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


@app.post("/auth/login")
def login(data: dict):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, email, role, student_id, employee_id
        FROM users
        WHERE email = %s AND password_hash = %s
    """, (data.get("email"), hash_password(data.get("password", ""))))

    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return {"error": "Invalid email or password"}

    # Block login for deactivated staff accounts
    if user[3] == "Staff":
        cursor.execute("SELECT is_active FROM teachers WHERE employee_id = %s", (user[5],))
        teacher_row = cursor.fetchone()
        if teacher_row and teacher_row[0] is False:
            cursor.close()
            conn.close()
            return {"error": "This account has been deactivated. Contact admin."}

    cursor.close()
    conn.close()

    return {
        "id"         : user[0],
        "name"       : user[1],
        "email"      : user[2],
        "role"       : user[3],
        "student_id" : user[4],
        "employee_id": user[5]
    }

@app.get("/student/{student_id}/profile")
def get_student_profile(student_id: str):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.student_id, s.student_name, s.department, s.section, s.year,
               s.semester, s.cgpa_current, s.gpa_previous, s.backlogs,
               s.attendance_percent, s.consecutive_absences, s.email, s.phone_number,
               t.teacher_name, t.email, t.employee_id,
               r.overall_risk_probability, r.cgpa_risk_probability,
               r.backlog_risk_probability, r.assignment_risk_probability,
               r.attendance_risk_probability
        FROM students s
        LEFT JOIN teachers t ON s.teacher_id = t.id
        LEFT JOIN risk_prediction r ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date) FROM risk_prediction WHERE student_id = s.student_id
            )
        WHERE s.student_id = %s
    """, (student_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return {"error": "Student not found"}

    return {
        "student_id"                  : row[0],
        "student_name"                : row[1],
        "department"                  : row[2],
        "section"                     : row[3],
        "year"                        : row[4],
        "semester"                    : row[5],
        "cgpa_current"                : float(row[6])  if row[6]  else 0,
        "gpa_previous"                : float(row[7])  if row[7]  else 0,
        "backlogs"                    : row[8]  or 0,
        "attendance_percent"          : float(row[9])  if row[9]  else 0,
        "consecutive_absences"        : row[10] or 0,
        "email"                       : row[11],
        "phone_number"                : row[12],
        "teacher_name"                : row[13],
        "teacher_email"               : row[14],
        "teacher_employee_id"         : row[15],
        "overall_risk_probability"    : float(row[16]) if row[16] else 0,
        "cgpa_risk_probability"       : float(row[17]) if row[17] else 0,
        "backlog_risk_probability"    : float(row[18]) if row[18] else 0,
        "assignment_risk_probability" : float(row[19]) if row[19] else 0,
        "attendance_risk_probability" : float(row[20]) if row[20] else 0,
    }


@app.get("/teacher/{employee_id}/students")
def get_teacher_students(employee_id: str):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id, teacher_name, designation FROM teachers WHERE employee_id = %s", (employee_id,))
    teacher = cursor.fetchone()

    if not teacher:
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    cursor.execute("""
        SELECT s.student_id, s.student_name, s.semester, s.section,
               s.cgpa_current, s.attendance_percent, s.backlogs, s.consecutive_absences,
               r.overall_risk_probability, r.attendance_risk_probability,
               r.cgpa_risk_probability, r.backlog_risk_probability, r.assignment_risk_probability
        FROM students s
        LEFT JOIN risk_prediction r ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date) FROM risk_prediction WHERE student_id = s.student_id
            )
        WHERE s.teacher_id = %s
        ORDER BY s.student_id ASC
    """, (teacher[0],))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {
        "teacher_name" : teacher[1],
        "designation"  : teacher[2],
        "employee_id"  : employee_id,
        "students": [
            {
                "student_id"                  : row[0],
                "student_name"                : row[1],
                "semester"                    : row[2],
                "section"                     : row[3],
                "cgpa_current"                : float(row[4])  if row[4]  else 0,
                "attendance_percent"          : float(row[5])  if row[5]  else 0,
                "backlogs"                    : row[6]  or 0,
                "consecutive_absences"        : row[7]  or 0,
                "overall_risk_probability"    : float(row[8])  if row[8]  else 0,
                "attendance_risk_probability" : float(row[9])  if row[9]  else 0,
                "cgpa_risk_probability"       : float(row[10]) if row[10] else 0,
                "backlog_risk_probability"    : float(row[11]) if row[11] else 0,
                "assignment_risk_probability" : float(row[12]) if row[12] else 0,
            }
            for row in rows
        ]
    }


@app.post("/leave/request")
def submit_leave(data: dict):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT teacher_id FROM students WHERE student_id = %s", (data.get("student_id"),))
    result = cursor.fetchone()

    if not result or not result[0]:
        cursor.close()
        conn.close()
        return {"error": "Student or assigned teacher not found"}

    cursor.execute("""
        INSERT INTO leave_requests (student_id, teacher_id, leave_type, leave_date, reason)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data.get("student_id"),
        result[0],
        data.get("leave_type"),
        data.get("leave_date"),
        data.get("reason")
    ))

    leave_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Leave request submitted", "leave_id": leave_id}


@app.get("/leave/student/{student_id}")
def get_student_leaves(student_id: str):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, leave_type, leave_date, reason, status, applied_date, teacher_comment
        FROM leave_requests
        WHERE student_id = %s
        ORDER BY applied_date DESC
    """, (student_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "id"              : row[0],
            "leave_type"      : row[1],
            "leave_date"      : str(row[2]) if row[2] else None,
            "reason"          : row[3],
            "status"          : row[4],
            "applied_date"    : str(row[5]) if row[5] else None,
            "teacher_comment" : row[6]
        }
        for row in rows
    ]


@app.get("/leave/teacher/{employee_id}")
def get_teacher_leaves(employee_id: str, status: str = None):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM teachers WHERE employee_id = %s", (employee_id,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    query  = """
        SELECT lr.id, lr.student_id, s.student_name, lr.leave_type,
               lr.leave_date, lr.reason, lr.status, lr.applied_date, lr.teacher_comment
        FROM leave_requests lr
        JOIN students s ON lr.student_id = s.student_id
        WHERE lr.teacher_id = %s
    """
    params = [result[0]]

    if status:
        query  += " AND lr.status = %s"
        params.append(status)

    query += " ORDER BY lr.applied_date DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "id"              : row[0],
            "student_id"      : row[1],
            "student_name"    : row[2],
            "leave_type"      : row[3],
            "leave_date"      : str(row[4]) if row[4] else None,
            "reason"          : row[5],
            "status"          : row[6],
            "applied_date"    : str(row[7]) if row[7] else None,
            "teacher_comment" : row[8]
        }
        for row in rows
    ]


@app.patch("/leave/{leave_id}")
def update_leave(leave_id: int, data: dict):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE leave_requests
        SET status = %s, teacher_comment = %s, reviewed_date = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id, status
    """, (data.get("status"), data.get("comment", ""), leave_id))

    result = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if not result:
        return {"error": "Leave request not found"}

    return {"message": f"Leave {result[1]}", "id": result[0]}


@app.get("/admin/departments")
def get_departments():
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s.department,
            COUNT(DISTINCT s.student_id)                                          as total_students,
            ROUND(AVG(s.cgpa_current)::numeric, 2)                               as avg_cgpa,
            ROUND(AVG(s.attendance_percent)::numeric, 1)                         as avg_attendance,
            COUNT(CASE WHEN r.overall_risk_probability >= 0.6 THEN 1 END)        as high_risk_count,
            COUNT(DISTINCT s.teacher_id)                                          as teacher_count
        FROM students s
        LEFT JOIN risk_prediction r ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date) FROM risk_prediction WHERE student_id = s.student_id
            )
        GROUP BY s.department
        ORDER BY s.department
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "department"     : row[0],
            "total_students" : row[1],
            "avg_cgpa"       : float(row[2]) if row[2] else 0,
            "avg_attendance" : float(row[3]) if row[3] else 0,
            "high_risk_count": row[4],
            "teacher_count"  : row[5]
        }
        for row in rows
    ]


@app.get("/admin/departments/{department}/teachers")
def get_dept_teachers(department: str):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            t.id, t.teacher_name, t.employee_id, t.designation,
            COUNT(DISTINCT s.student_id)                                       as student_count,
            ROUND(AVG(s.cgpa_current)::numeric, 2)                            as avg_cgpa,
            ROUND(AVG(s.attendance_percent)::numeric, 1)                      as avg_attendance,
            COUNT(CASE WHEN r.overall_risk_probability >= 0.6 THEN 1 END)     as high_risk_count
        FROM teachers t
        LEFT JOIN students s ON s.teacher_id = t.id
        LEFT JOIN risk_prediction r ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date) FROM risk_prediction WHERE student_id = s.student_id
            )
        WHERE t.department ILIKE %s
        GROUP BY t.id, t.teacher_name, t.employee_id, t.designation
        ORDER BY t.id
    """, (f"%{department}%",))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "teacher_name"   : row[1],
            "employee_id"    : row[2],
            "designation"    : row[3],
            "student_count"  : row[4],
            "avg_cgpa"       : float(row[5]) if row[5] else 0,
            "avg_attendance" : float(row[6]) if row[6] else 0,
            "high_risk_count": row[7]
        }
        for row in rows
    ]


@app.get("/admin/teacher/{employee_id}/full-students")
def get_teacher_full_students(employee_id: str):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, teacher_name, designation FROM teachers WHERE employee_id = %s",
        (employee_id,)
    )
    teacher = cursor.fetchone()

    if not teacher:
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    cursor.execute("""
        SELECT
            s.student_id, s.student_name, s.email, s.semester, s.year,
            s.cgpa_current, s.backlogs, s.attendance_percent, s.consecutive_absences,
            r.overall_risk_probability, r.attendance_risk_probability,
            COUNT(lr.id)                                           as total_leaves,
            COUNT(CASE WHEN lr.status = 'Pending' THEN 1 END)     as pending_leaves
        FROM students s
        LEFT JOIN risk_prediction r ON s.student_id = r.student_id
            AND r.prediction_date = (
                SELECT MAX(prediction_date) FROM risk_prediction WHERE student_id = s.student_id
            )
        LEFT JOIN leave_requests lr ON s.student_id = lr.student_id
        WHERE s.teacher_id = %s
        GROUP BY s.student_id, s.student_name, s.email, s.semester, s.year,
                 s.cgpa_current, s.backlogs, s.attendance_percent, s.consecutive_absences,
                 r.overall_risk_probability, r.attendance_risk_probability
        ORDER BY s.student_id ASC
    """, (teacher[0],))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return {
        "teacher_name" : teacher[1],
        "designation"  : teacher[2],
        "employee_id"  : employee_id,
        "students"     : [
            {
                "student_id"                  : row[0],
                "student_name"                : row[1],
                "email"                       : row[2],
                "semester"                    : row[3],
                "year"                        : row[4],
                "cgpa_current"                : float(row[5]) if row[5] else 0,
                "backlogs"                    : row[6] or 0,
                "attendance_percent"          : float(row[7]) if row[7] else 0,
                "consecutive_absences"        : row[8] or 0,
                "overall_risk_probability"    : float(row[9]) if row[9] else 0,
                "attendance_risk_probability" : float(row[10]) if row[10] else 0,
                "total_leaves"                : row[11],
                "pending_leaves"              : row[12]
            }
            for row in rows
        ]
    }

UPLOAD_DIR = "uploads/exam_schedules"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/admin/exam-schedule/upload")
async def upload_exam_schedule(
    department    : str = Form(...),
    year          : str = Form(...),
    exam_type     : str = Form(...),
    visible_from  : str = Form(...),
    visible_until : str = Form(...),
    file          : UploadFile = File(...)
):
    conn   = get_conn()
    cursor = conn.cursor()

    contents  = await file.read()
    file_path = os.path.join(UPLOAD_DIR, f"{department}_{year}_{exam_type}_{file.filename}".replace(" ", "_"))

    with open(file_path, "wb") as f:
        f.write(contents)

    cursor.execute("""
        INSERT INTO exam_schedules (department, year, exam_type, file_name, file_path, visible_from, visible_until)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (department, year, exam_type, file.filename, file_path, visible_from, visible_until))

    schedule_id = cursor.fetchone()[0]

    try:
        df = pd.read_excel(io.BytesIO(contents))
        df.columns = [str(c).strip().lower() for c in df.columns]

        def find_col(options):
            for o in options:
                if o in df.columns:
                    return o
            return None

        subj_col = find_col(['subject', 'subject name', 'course'])
        code_col = find_col(['subject code', 'code', 'course code'])
        date_col = find_col(['date', 'exam date'])
        time_col = find_col(['time', 'exam time'])
        venue_col = find_col(['venue', 'location', 'hall'])
        dur_col  = find_col(['duration'])

        for _, row in df.iterrows():
            exam_date = row[date_col] if date_col else None
            if pd.isna(exam_date):
                exam_date = None
            else:
                exam_date = pd.to_datetime(exam_date).date()

            cursor.execute("""
                INSERT INTO exam_schedule_items
                (schedule_id, subject, subject_code, exam_date, exam_time, venue, duration)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                schedule_id,
                str(row[subj_col]) if subj_col else '',
                str(row[code_col]) if code_col else '',
                exam_date,
                str(row[time_col])  if time_col  else '',
                str(row[venue_col]) if venue_col else '',
                str(row[dur_col])   if dur_col   else ''
            ))

    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"error": f"Failed to parse excel: {str(e)}"}

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Exam schedule uploaded successfully", "schedule_id": schedule_id}


@app.get("/admin/exam-schedules")
def get_all_exam_schedules():
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, department, year, exam_type, file_name, visible_from, visible_until, created_at
        FROM exam_schedules ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()

    result = []
    for row in rows:
        cursor.execute("""
            SELECT subject, subject_code, exam_date, exam_time, venue, duration
            FROM exam_schedule_items WHERE schedule_id = %s ORDER BY exam_date ASC
        """, (row[0],))
        items = cursor.fetchall()

        result.append({
            "id"            : row[0],
            "department"    : row[1],
            "year"          : row[2],
            "exam_type"     : row[3],
            "file_name"     : row[4],
            "visible_from"  : str(row[5]) if row[5] else None,
            "visible_until" : str(row[6]) if row[6] else None,
            "created_at"    : str(row[7]),
            "items": [
                {
                    "subject"      : i[0],
                    "subject_code" : i[1],
                    "exam_date"    : str(i[2]) if i[2] else None,
                    "exam_time"    : i[3],
                    "venue"        : i[4],
                    "duration"     : i[5]
                }
                for i in items
            ]
        })

    cursor.close()
    conn.close()
    return result


@app.delete("/admin/exam-schedule/{schedule_id}")
def delete_exam_schedule(schedule_id: int):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT file_path FROM exam_schedules WHERE id = %s", (schedule_id,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        conn.close()
        return {"error": "Schedule not found"}

    cursor.execute("DELETE FROM exam_schedules WHERE id = %s", (schedule_id,))
    conn.commit()
    cursor.close()
    conn.close()

    if row[0] and os.path.exists(row[0]):
        try:
            os.remove(row[0])
        except Exception:
            pass

    return {"message": "Schedule deleted"}


@app.get("/admin/exam-schedule/{schedule_id}/download")
def download_exam_schedule(schedule_id: int):
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path, file_name FROM exam_schedules WHERE id = %s", (schedule_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row or not row[0] or not os.path.exists(row[0]):
        return {"error": "File not found"}

    return FileResponse(row[0], filename=row[1])


def _active_schedules_for(department, year):
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, department, year, exam_type, file_name, visible_from, visible_until
        FROM exam_schedules
        WHERE (department = %s OR department = 'All')
          AND (year = %s OR year = 'All')
          AND CURRENT_DATE BETWEEN visible_from AND visible_until
        ORDER BY visible_from ASC
    """, (department, str(year)))

    rows = cursor.fetchall()
    result = []
    for row in rows:
        cursor.execute("""
            SELECT subject, subject_code, exam_date, exam_time, venue, duration
            FROM exam_schedule_items WHERE schedule_id = %s ORDER BY exam_date ASC
        """, (row[0],))
        items = cursor.fetchall()

        result.append({
            "id"            : row[0],
            "department"    : row[1],
            "year"          : row[2],
            "exam_type"     : row[3],
            "file_name"     : row[4],
            "visible_from"  : str(row[5]),
            "visible_until" : str(row[6]),
            "items": [
                {
                    "subject"      : i[0],
                    "subject_code" : i[1],
                    "exam_date"    : str(i[2]) if i[2] else None,
                    "exam_time"    : i[3],
                    "venue"        : i[4],
                    "duration"     : i[5]
                }
                for i in items
            ]
        })

    cursor.close()
    conn.close()
    return result


@app.get("/exam-schedule/student/{student_id}")
def get_student_exam_schedule(student_id: str):
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT department, year FROM students WHERE student_id = %s", (student_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return []

    department, year = row
    try:
        year_str = str(int(float(year)))
    except Exception:
        year_str = 'All'

    return _active_schedules_for(department, year_str)


@app.get("/exam-schedule/teacher/{employee_id}")
def get_teacher_exam_schedule(employee_id: str):
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT department FROM teachers WHERE employee_id = %s", (employee_id,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        conn.close()
        return []

    department = row[0]

    cursor.execute("""
        SELECT id, department, year, exam_type, file_name, visible_from, visible_until
        FROM exam_schedules
        WHERE (department = %s OR department = 'All')
          AND CURRENT_DATE BETWEEN visible_from AND visible_until
        ORDER BY visible_from ASC
    """, (department,))
    rows = cursor.fetchall()

    result = []
    for row in rows:
        cursor.execute("""
            SELECT subject, subject_code, exam_date, exam_time, venue, duration
            FROM exam_schedule_items WHERE schedule_id = %s ORDER BY exam_date ASC
        """, (row[0],))
        items = cursor.fetchall()
        result.append({
            "id"            : row[0],
            "department"    : row[1],
            "year"          : row[2],
            "exam_type"     : row[3],
            "file_name"     : row[4],
            "visible_from"  : str(row[5]),
            "visible_until" : str(row[6]),
            "items": [
                {
                    "subject"      : i[0],
                    "subject_code" : i[1],
                    "exam_date"    : str(i[2]) if i[2] else None,
                    "exam_time"    : i[3],
                    "venue"        : i[4],
                    "duration"     : i[5]
                }
                for i in items
            ]
        })

    cursor.close()
    conn.close()
    return result

from typing import List, Optional


class AssignRequest(BaseModel):
    student_ids: List[str]
    teacher_id: int


class RemoveRequest(BaseModel):
    student_ids: List[str]


@app.get("/admin/mentor-allocation/teachers")
def get_teachers_for_allocation(department: Optional[str] = None):
    conn = get_conn()
    cursor = conn.cursor()

    query = """
        SELECT t.id, t.teacher_name, t.employee_id, t.department,
               COUNT(s.student_id) as student_count, t.is_active
        FROM teachers t
        LEFT JOIN students s ON s.teacher_id = t.id
    """
    params = ()
    if department:
        query += " WHERE t.department = %s"
        params = (department,)
    query += " GROUP BY t.id, t.teacher_name, t.employee_id, t.department, t.is_active ORDER BY t.teacher_name"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "id"            : row[0],
            "teacher_name"  : row[1],
            "employee_id"   : row[2],
            "department"    : row[3],
            "student_count" : row[4],
            "is_active"     : row[5]
        }
        for row in rows
    ]

@app.get("/admin/mentor-allocation/students")
def get_students_for_allocation(
    department: Optional[str] = None,
    year: Optional[str] = None,
    section: Optional[str] = None,
    unassigned_only: bool = False
):
    conn = get_conn()
    cursor = conn.cursor()

    query = """
        SELECT s.student_id, s.student_name, s.department, s.year, s.section,
               s.teacher_id, t.teacher_name, t.employee_id
        FROM students s
        LEFT JOIN teachers t ON s.teacher_id = t.id
        WHERE 1=1
    """
    params = []
    if department:
        query += " AND s.department = %s"
        params.append(department)
    if year:
        query += " AND s.year = %s"
        params.append(year)
    if section:
        query += " AND s.section = %s"
        params.append(section)
    if unassigned_only:
        query += " AND s.teacher_id IS NULL"
    query += " ORDER BY s.student_id ASC"

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "student_id"   : row[0],
            "student_name" : row[1],
            "department"   : row[2],
            "year"         : row[3],
            "section"      : row[4],
            "teacher_id"   : row[5],
            "teacher_name" : row[6],
            "employee_id"  : row[7]
        }
        for row in rows
    ]


@app.post("/admin/mentor-allocation/assign")
def assign_students_to_teacher(payload: AssignRequest):
    if not payload.student_ids:
        return {"error": "No students provided"}

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM teachers WHERE id = %s", (payload.teacher_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    cursor.execute(
        "UPDATE students SET teacher_id = %s WHERE student_id = ANY(%s)",
        (payload.teacher_id, payload.student_ids)
    )
    updated = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()

    return {"success": True, "updated_count": updated}


@app.post("/admin/mentor-allocation/remove")
def remove_students_from_teacher(payload: RemoveRequest):
    if not payload.student_ids:
        return {"error": "No students provided"}

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE students SET teacher_id = NULL WHERE student_id = ANY(%s)",
        (payload.student_ids,)
    )
    updated = cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()

    return {"success": True, "updated_count": updated}


@app.post("/admin/mentor-allocation/upload")
async def upload_mentor_allocation(
    department: str = Form(...),
    year: str = Form(...),
    section: str = Form(...),
    teacher_id: int = Form(...),
    file: UploadFile = File(...)
):
    contents = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        return {"error": f"Could not read Excel file: {str(e)}"}

    id_col = None
    for col in df.columns:
        if str(col).strip().lower() in ("student_id", "roll number", "roll_no", "rollnumber", "student id"):
            id_col = col
            break
    if id_col is None:
        return {"error": "Could not find a student_id / roll number column in the sheet"}

    student_ids = df[id_col].astype(str).str.strip().tolist()

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM teachers WHERE id = %s", (teacher_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    cursor.execute("SELECT student_id FROM students WHERE student_id = ANY(%s)", (student_ids,))
    found_ids = [row[0] for row in cursor.fetchall()]
    missing_ids = list(set(student_ids) - set(found_ids))

    updated = 0
    if found_ids:
        cursor.execute(
            "UPDATE students SET teacher_id = %s WHERE student_id = ANY(%s)",
            (teacher_id, found_ids)
        )
        updated = cursor.rowcount

    conn.commit()
    cursor.close()
    conn.close()

    return {
        "success": True,
        "updated_count": updated,
        "missing_count": len(missing_ids),
        "missing_ids": missing_ids
    }

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    event_type: str
    venue: str
    event_date: str
    event_time: Optional[str] = ""
    department: Optional[str] = "All"
    year: Optional[str] = "All"
    max_participants: Optional[int] = None


def compute_event_status(event_date):
    from datetime import date as date_cls
    today = date_cls.today()
    if event_date > today:
        return "Upcoming"
    elif event_date == today:
        return "Ongoing"
    else:
        return "Completed"


@app.post("/admin/events")
def create_event(data: EventCreate):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO events (title, description, event_type, venue, event_date,
                             event_time, department, year, max_participants)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data.title, data.description, data.event_type, data.venue,
        data.event_date, data.event_time, data.department, data.year,
        data.max_participants
    ))

    event_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Event created", "id": event_id}


@app.get("/admin/events")
def get_all_events():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.id, e.title, e.description, e.event_type, e.venue, e.event_date,
               e.event_time, e.department, e.year, e.max_participants, e.created_at,
               COUNT(er.id) as participant_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        GROUP BY e.id
        ORDER BY e.event_date DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "id"               : row[0],
            "title"            : row[1],
            "description"      : row[2],
            "event_type"       : row[3],
            "venue"            : row[4],
            "event_date"       : str(row[5]),
            "event_time"       : row[6],
            "department"       : row[7],
            "year"             : row[8],
            "max_participants" : row[9],
            "created_at"       : str(row[10]),
            "participant_count": row[11],
            "status"           : compute_event_status(row[5])
        }
        for row in rows
    ]


@app.get("/admin/events/{event_id}")
def get_event_details(event_id: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, event_type, venue, event_date,
               event_time, department, year, max_participants, created_at
        FROM events WHERE id = %s
    """, (event_id,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        conn.close()
        return {"error": "Event not found"}

    cursor.execute("""
        SELECT s.student_id, s.student_name, s.department, s.year,
               s.email, er.registration_date, er.status
        FROM event_registrations er
        JOIN students s ON er.student_id = s.student_id
        WHERE er.event_id = %s
        ORDER BY er.registration_date ASC
    """, (event_id,))
    regs = cursor.fetchall()
    cursor.close()
    conn.close()

    return {
        "id"               : row[0],
        "title"            : row[1],
        "description"      : row[2],
        "event_type"       : row[3],
        "venue"            : row[4],
        "event_date"       : str(row[5]),
        "event_time"       : row[6],
        "department"       : row[7],
        "year"             : row[8],
        "max_participants" : row[9],
        "created_at"       : str(row[10]),
        "status"           : compute_event_status(row[5]),
        "registered_students": [
            {
                "student_id"       : r[0],
                "student_name"     : r[1],
                "department"       : r[2],
                "year"             : r[3],
                "email"            : r[4],
                "registration_date": str(r[5]),
                "status"           : r[6]
            }
            for r in regs
        ]
    }


@app.delete("/admin/events/{event_id}")
def delete_event(event_id: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM events WHERE id = %s", (event_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return {"error": "Event not found"}

    cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Event deleted"}


@app.post("/events/{event_id}/register")
def register_for_event(event_id: int, data: dict):
    student_id = data.get("student_id")
    if not student_id:
        return {"error": "student_id required"}

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id, max_participants FROM events WHERE id = %s", (event_id,))
    event = cursor.fetchone()
    if not event:
        cursor.close()
        conn.close()
        return {"error": "Event not found"}

    if event[1] is not None:
        cursor.execute("SELECT COUNT(*) FROM event_registrations WHERE event_id = %s", (event_id,))
        current_count = cursor.fetchone()[0]
        if current_count >= event[1]:
            cursor.close()
            conn.close()
            return {"error": "Event is full"}

    try:
        cursor.execute("""
            INSERT INTO event_registrations (event_id, student_id)
            VALUES (%s, %s)
            RETURNING id
        """, (event_id, student_id))
        reg_id = cursor.fetchone()[0]
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"error": "Already registered for this event"}

    cursor.close()
    conn.close()
    return {"message": "Registered successfully", "registration_id": reg_id}


def _events_for(department, year):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.id, e.title, e.description, e.event_type, e.venue, e.event_date,
               e.event_time, e.department, e.year, e.max_participants,
               COUNT(er.id) as participant_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        WHERE (e.department = %s OR e.department = 'All')
          AND (e.year = %s OR e.year = 'All')
        GROUP BY e.id
        ORDER BY e.event_date DESC
    """, (department, str(year)))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [
        {
            "id"               : row[0],
            "title"            : row[1],
            "description"      : row[2],
            "event_type"       : row[3],
            "venue"            : row[4],
            "event_date"       : str(row[5]),
            "event_time"       : row[6],
            "department"       : row[7],
            "year"             : row[8],
            "max_participants" : row[9],
            "participant_count": row[10],
            "status"           : compute_event_status(row[5])
        }
        for row in rows
    ]


@app.get("/events/student/{student_id}")
def get_student_events(student_id: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT department, year FROM students WHERE student_id = %s", (student_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return []

    department, year = row
    try:
        year_str = str(int(float(year)))
    except Exception:
        year_str = 'All'

    return _events_for(department, year_str)


@app.get("/events/teacher/{employee_id}")
def get_teacher_events(employee_id: str):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT department FROM teachers WHERE employee_id = %s", (employee_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return []

    return _events_for(row[0], 'All')


class ReassignRequest(BaseModel):
    old_teacher_id: int
    new_teacher_id: int


@app.post("/admin/teacher/reassign")
def reassign_teacher(payload: ReassignRequest):
    if payload.old_teacher_id == payload.new_teacher_id:
        return {"error": "Old and new teacher must be different"}

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id, teacher_name FROM teachers WHERE id = %s", (payload.old_teacher_id,))
    old_teacher = cursor.fetchone()
    cursor.execute("SELECT id, teacher_name FROM teachers WHERE id = %s", (payload.new_teacher_id,))
    new_teacher = cursor.fetchone()

    if not old_teacher or not new_teacher:
        cursor.close()
        conn.close()
        return {"error": "One or both teachers not found"}

    cursor.execute(
        "UPDATE students SET teacher_id = %s WHERE teacher_id = %s",
        (payload.new_teacher_id, payload.old_teacher_id)
    )
    students_moved = cursor.rowcount

    cursor.execute(
        "UPDATE leave_requests SET teacher_id = %s WHERE teacher_id = %s AND status = 'Pending'",
        (payload.new_teacher_id, payload.old_teacher_id)
    )
    leaves_rerouted = cursor.rowcount

    # Deactivate the outgoing teacher's login
    cursor.execute(
        "UPDATE teachers SET is_active = FALSE WHERE id = %s",
        (payload.old_teacher_id,)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return {
        "success": True,
        "old_teacher": old_teacher[1],
        "new_teacher": new_teacher[1],
        "students_moved": students_moved,
        "leaves_rerouted": leaves_rerouted,
        "old_teacher_deactivated": True
    }


@app.post("/admin/teacher/{teacher_id}/reactivate")
def reactivate_teacher(teacher_id: int):
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT id, teacher_name FROM teachers WHERE id = %s", (teacher_id,))
    teacher = cursor.fetchone()

    if not teacher:
        cursor.close()
        conn.close()
        return {"error": "Teacher not found"}

    cursor.execute("UPDATE teachers SET is_active = TRUE WHERE id = %s", (teacher_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"success": True, "message": f"{teacher[1]} reactivated"}


@app.get("/admin/leaves/pending-count")
def get_pending_leaves_count():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'Pending'")
    count = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return {"pending_count": count}


DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "myapp"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD"),
    "port": os.getenv("DB_PORT", "5432")
}