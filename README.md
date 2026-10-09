# 🎓 College Placement Analytics & Management System

A full-stack web application for managing, tracking, and visualizing campus placement data — with bulk CSV/XLSX imports, live analytics dashboards, PDF report generation, and AI-driven insights.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **UI / Charts** | Bootstrap 5, Bootstrap Icons, Chart.js 4 |
| **Backend** | Python 3.11+, Flask 3.0, Gunicorn |
| **Auth** | JWT (Flask-JWT-Extended), bcrypt |
| **ORM / DB** | SQLAlchemy, Flask-Migrate, MySQL 8.0 |
| **Data Processing** | Pandas, NumPy, scikit-learn |
| **PDF Reports** | ReportLab |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## ✨ Features

### 👩‍💼 Admin Portal (JWT Protected)
- Secure login with bcrypt-hashed passwords
- Full **CRUD** for Students, Companies, Departments, and Placements
- **Bulk upload** placement data via CSV / XLSX (Pandas-powered parser with row-level validation)
- **PDF report generation** — department, company, yearly, and summary reports
- Upload history tracking with status (`pending / processed / failed`)

### 📊 Public Dashboard (No Login Required)
- Live KPIs — total students, placed, unplaced, opted-out, placement rate
- Avg / Max / Min / Median package (LPA) with year filter
- Department-wise analytics with bar + line charts
- Company-wise analytics and sector distribution (doughnut chart)
- Year-on-year trends across all placement cycles

### 🤖 AI Insights
Rule-based plain-English observations generated automatically:
> *"Excellent placement performance: 84% of students are placed this year."*
> *"TCS is the top recruiter with 42 hires."*
> *"Placement count is up by 15 compared to 2023 (78 → 93 in 2024)."*

---

## 🗂️ Project Structure

```
college-placement-analytics/
├── backend/                  # Flask API
│   ├── app/
│   │   ├── models/           # SQLAlchemy models (Student, Company, Placement …)
│   │   ├── routes/           # Blueprints — auth, students, analytics, reports …
│   │   └── utils/            # analytics_service, report_generator, ai_insights
│   ├── schema.sql            # MySQL schema (auto-loaded by Docker)
│   ├── seed.py               # Creates DB tables + default admin
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # admin/ and public/ page components
│   │   ├── components/       # charts/, common/ UI components
│   │   ├── context/          # AuthContext (JWT state)
│   │   └── api/              # Axios instance + API helpers
│   └── Dockerfile
├── sample_data.csv           # 50-student sample CSV for testing uploads
├── docker-compose.yml        # Dev / production stack
├── docker-compose.prod.yml   # Production overrides
├── .env.example              # Environment variable template
└── Makefile                  # Convenience commands
```

---

## ⚡ Quick Start

### Option A — Docker (Recommended)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) & Docker Compose

```bash
# 1. Clone the repo
git clone https://github.com/Ishabharti-og/college-placement-analytics.git
cd college-placement-analytics

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in SECRET_KEY, JWT_SECRET_KEY, and DB credentials

# 3. Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (React) | http://localhost |
| Backend API | http://localhost:5000/api |
| MySQL | localhost:3306 |

```bash
# 4. Seed the database (first run only)
docker compose exec backend python seed.py
# Default admin → username: admin | password: Admin@1234
```

---

### Option B — Local Development (without Docker)

**Prerequisites:** Python 3.11+, Node.js 20+, MySQL 8.0 running locally

**Step 1 — Backend**
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL pointing to your local MySQL
python seed.py              # creates tables + default admin
python run.py               # Flask starts on http://localhost:5000
```

**Step 2 — Frontend** *(open a second terminal)*
```bash
cd frontend
npm install
npm run dev                 # Vite starts on http://localhost:3000
```

**Step 3 — Open in browser**

| URL | Page |
|---|---|
| `http://localhost:3000` | Public analytics dashboard |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/admin/dashboard` | Admin panel (after login) |

> The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no extra configuration needed.

---

## 📂 Sample Data

A ready-to-use CSV file with **50 students** across 7 departments is included at [`sample_data.csv`](sample_data.csv).

**To use it:**
1. Log in to the admin panel
2. Go to **Upload Data** in the sidebar
3. First create the departments via **Departments** → Add (or they'll be created automatically if using the seed)
4. Upload `sample_data.csv`
5. The public dashboard will immediately show real data

**Required CSV columns:**
```
student_name, roll_number, email, department, batch_year,
company_name, package_lpa, year
```

**Optional columns:**
```
cgpa, sector, location, role, offer_date
```

---

## 🔌 API Endpoints

| Module | Base Path |
|---|---|
| Authentication | `POST /api/auth/login` |
| Students | `/api/students` |
| Departments | `/api/departments` |
| Companies | `/api/companies` |
| Placements | `/api/placements` |
| Analytics | `/api/analytics` |
| File Upload | `/api/upload` |
| Reports | `/api/reports` |

---

## 🗄️ Database

**Name:** `college_placement`  
**Tables (7):** `admins` · `departments` · `students` · `companies` · `placements` · `uploaded_files` · `reports`

The schema is in [`backend/schema.sql`](backend/schema.sql) and is automatically applied when the MySQL Docker container starts for the first time.

---

## 🔐 Security

| Concern | Implementation |
|---|---|
| Authentication | JWT Bearer tokens (8 hr expiry) |
| Passwords | bcrypt hashing |
| Secrets | `.env` file — **never committed to git** |
| CORS | Configurable origin whitelist via `CORS_ORIGINS` env var |
| File uploads | Extension whitelist (`.csv`, `.xlsx`), 32 MB max |
| Production | Startup assertions block weak default secret keys |

---

## 📄 License

This project is for educational purposes. Feel free to fork and extend.

---

<p align="center">College Placement Analytics — A professional placement management system</p>
