# Student Risk Prediction System (SRPS)

A full-stack AI-powered academic monitoring platform for an engineering college. It identifies at-risk students using XGBoost machine learning predictions and provides role-based dashboards for Admin, Staff (Teacher/Mentor), and Student users.

The system automates:
- Reading student data from Excel spreadsheets
- Storing it in PostgreSQL
- Running ML predictions on each student
- Serving results via FastAPI REST endpoints
- Displaying everything on a React frontend with role-based access

---

## Tech Stack

**Backend — Java**
- Java 17, Maven
- Apache POI 5.2.5 (reads `.xlsx` files)
- PostgreSQL JDBC Driver 42.7.3
- Jackson Databind 2.15.2
- Log4j 2.20.0

**Backend — Python**
- Python 3.13, FastAPI, Uvicorn
- psycopg2 (PostgreSQL connector)
- pandas + XGBoost (ML pipeline)
- python-dotenv (environment config)

**Database**
- PostgreSQL

**Frontend**
- React 19 + Vite
- React Router DOM 7
- Recharts (charts/graphs)
- react-icons/md
- XLSX (client-side spreadsheet parsing)

---

## Project Structure

```
student-risk-prediction-system/
├── backend-java/           # Excel importer (Apache POI + JDBC)
│   ├── src/main/java/com/tansam/ExcelImporter.java
│   ├── data/students_update.xlsx
│   └── pom.xml
├── backend-python/         # FastAPI server + ML pipeline
│   ├── main.py
│   ├── predict_all.py
│   ├── setup_db.py
│   ├── models/dropout_multi_model.pkl
│   ├── uploads/exam_schedules/
│   └── .env.example
├── frontend/                # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## Prerequisites

Install these before setup:
- **Java 17** + **Maven**
- **Python 3.13**
- **Node.js** (v18+) + npm
- **PostgreSQL** (v14+)

---

## Setup

### 1. Database

Create the database and required tables (see [Database Schema](#database-schema) below for full DDL), then run the one-time setup script to seed teachers and users:

```bash
cd backend-python
python setup_db.py
```

### 2. Backend — Python (FastAPI)

```bash
cd backend-python
pip install -r requirements.txt --break-system-packages
```

If `requirements.txt` isn't present yet, install manually:
```bash
pip install fastapi uvicorn psycopg2-binary pandas xgboost python-multipart python-dotenv --break-system-packages
```

Copy the environment template and fill in your real DB credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_PORT=5432
```

Run the server:
```bash
uvicorn main:app --reload
```
- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 3. Backend — Java (Excel Importer)

Only needed when importing/updating student data from Excel.

```bash
cd backend-java
mvn compile exec:java -Dexec.mainClass="com.tansam.ExcelImporter"
```

**Important:** the FastAPI server (step 2) must already be running before you run this — the Java importer automatically triggers `predict_all.py` after the Excel import completes.

**Note:** `ExcelImporter.java` currently calls `predict_all.py` via a hardcoded file path (`ProcessBuilder`). Update that path to match your local machine before running.

### 4. Frontend — React

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` (or next available port).

---

## Startup Order (every session)

1. Confirm PostgreSQL is running
2. Start FastAPI (`backend-python`) — **must be first**
3. Start React (`frontend`)
4. Only run the Java importer (`backend-java`) if new Excel data needs to be loaded

---

## Environment Variables

`backend-python/.env` (not committed — copy from `.env.example`):

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host (usually `localhost`) |
| `DB_NAME` | Database name |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_PORT` | PostgreSQL port (usually `5432`) |

---

## Database Schema

Core tables: `students`, `risk_prediction`, `teachers`, `users`, `leave_requests`, `exam_schedules`, `exam_schedule_items`, `events`, `event_registrations`.

Key relationships:
- Each `student` belongs to one `teacher` (mentor) via `teacher_id`
- `risk_prediction` stores full prediction history per student (never overwritten — latest is picked via `MAX(prediction_date)`)
- `leave_requests` auto-routes to the student's assigned teacher
- `events` support department/year targeting (`department = 'All'` or a specific dept, same for `year`)

Full column-level schema is documented inline in `backend-python/main.py` and in the original project spec (ask a team member if you need the complete DDL script).

---

## Machine Learning Pipeline

- Model file: `backend-python/models/dropout_multi_model.pkl`
- Contains 4 working XGBoost sub-models (`cgpa_model`, `backlog_model`, `assignment_model`, `attendance_model`) — the bundled `overall_model` is broken (returns a constant), so `overall_risk` is computed as a weighted average instead:
  ```
  overall_risk = (cgpa_risk × 0.30) + (backlog_risk × 0.25) + (attendance_risk × 0.25) + (assignment_risk × 0.20)
  ```
- **Critical:** the model requires a `pandas.DataFrame` as input with exact column names `['gpa_current', 'gpa_previous', 'backlogs', 'attendance', 'absences']`. Passing a numpy array silently breaks predictions (produces constant output).

Risk level thresholds (used throughout the frontend):
```
overall_risk >= 0.6  → High Risk
overall_risk >= 0.3  → Medium Risk
overall_risk <  0.3  → Low Risk
```

---

## Login Credentials (Demo / Test Accounts)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@college.edu` | `ADMIN@2024` |
| Staff | any teacher email (e.g. `raj.kumar@college.edu`) | `TEACH@2024` |
| Student | any student email | their roll number (e.g. `CSE20260002`) |

Password hashing is SHA-256, no salt, no JWT — sufficient for an academic demo, **not production-grade**. If this ever goes beyond a college project, add salted hashing and token-based auth.

---

## Known Limitations / Notes for Whoever Picks This Up

- Route order matters in `main.py` — static routes (e.g. `/students/all`) must be declared **before** dynamic routes (e.g. `/students/{id}`), or FastAPI will misroute requests.
- Deactivated teacher accounts (`is_active = FALSE` in `teachers` table) are blocked at login but there's currently no UI to bulk-manage this beyond the Mentor Allocation page's reactivate button.
- Attendance monthly-trend charts use illustrative placeholder data — there's no monthly attendance history table in the DB yet.
- CORS is currently wide open (`allow_origins=["*"]`) for local dev convenience — tighten this before any real deployment.

---

## Contact

Built by Rahul — reach out for context on any of the above before making structural changes.
