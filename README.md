# Academic Analytics Dashboard System

An end-to-end MERN + Machine Learning project for academic performance analysis. Faculty can manage student records, monitor department and semester trends, review subject-wise analytics, and identify at-risk students through an interactive dashboard and predictive insights.

---

## 🚀 Tech Stack

### 🔧 Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication

### 🤖 ML Microservice
- Python
- Pandas, Scikit-learn
- Joblib

### 💻 Frontend
- React.js
- Axios
- Tailwind
- Material UI
- React Router DOM, Formik + Yup, Toastify

---

## 📦 Features

- ✅ Teacher register/login with protected routes
- ✅ Create and edit academic student profiles
- ✅ Track department, semester, gender, course, GPA, attendance, and credits
- ✅ Store subject-wise marks and attendance
- ✅ Interactive dashboard with KPI cards and drill-down views
- ✅ Department performance, semester trends, subject analytics, and attendance-mark correlation
- ✅ Predictive at-risk classification with risk score and risk level
- ✅ Student profile page with academic analytics and prediction history
- ✅ Filtering by student, department, semester, gender, and subject

---

## 🧮 Predictive Analytics

- Python microservice supports model-based prediction using:
  - Attendance (%)
  - Study Hours per Day
  - Previous Marks (%)
  - Assignment Score

- The web app also computes a dashboard-friendly academic risk profile using:
  - GPA
  - Subject average
  - Attendance
  - Study hours
  - Previous performance

- Outputs:
  - `On Track` or `At Risk`
  - `Low`, `Moderate`, or `High` risk level
  - Numeric risk score for prioritization

---

## 📁 Project Structure
<pre>
📦 root
├── 📁 server                           # Backend + ML Microservice
│   ├── 📁 microservice                 # Python ML code
│   │   ├── generate_training_data_1000.py
│   │   ├── predict.py
│   │   ├── student_performance_dataset.csv
│   │   ├── student_performance_model.joblib
│   │   └── train_model.py
│   ├── 📁 src                          # Node.js + Express backend
│   │   ├── 📁 controllers
│   │   ├── 📁 middlewares
│   │   ├── 📁 models
│   │   ├── 📁 utils
│   │   └── 📁 routes
│   ├── .env.example
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── server.js

├── 📁 client                          # React.js Frontend
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   ├── 📁 pages
│   │   │   ├── 📁 Auth
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── AddStudentForm.jsx
│   │   │   ├── EditStudentForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Header.jsx
│   │   │   └── StudentDetails.jsx
│   │   ├── 📁 services
│   │   │   ├── api.js
│   │   │   └── toastNotifications.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── constants.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   └── eslint.config.js

├── README.md

</pre>

---

## Dashboard Views

- University-style summary cards for attendance, GPA, marks, pass rate, and at-risk count
- Department performance comparison
- Semester GPA trend line
- Subject outcome ranking
- Attendance vs marks scatter plot
- At-risk student watchlist with drill-down to student level

## Current Scope

This version now behaves as an academic analytics dashboard system within the current MERN architecture. It is optimized for faculty-level academic monitoring and student-level drill-down analysis.
