import os
import pandas as pd
import random

CURRENT_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(CURRENT_DIR, "student_performance_dataset.csv")

DEPARTMENTS = [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil",
    "Business Analytics",
]
GENDERS = ["Male", "Female", "Non-binary"]
COURSES = ["B.Tech", "BCA", "MCA", "MBA", "B.Sc"]


def clamp(value, low, high):
    return max(low, min(high, value))


def generate_profile():
    department = random.choice(DEPARTMENTS)
    semester = random.randint(1, 8)
    gender = random.choice(GENDERS)
    age = random.randint(17, 25)
    course = random.choice(COURSES)
    attendance = random.randint(48, 98)
    study_hours = round(random.uniform(0.5, 6.5), 1)
    previous_marks = random.randint(38, 96)
    assignment_score = round(random.uniform(3.5, 10.0), 1)
    gpa = round(random.uniform(4.8, 9.7), 1)
    credits_earned = random.randint(12, 28) + (semester - 1) * 4

    subject_average = clamp(
        round(previous_marks * 0.55 + attendance * 0.15 + gpa * 3 + study_hours * 2.5 + random.uniform(-8, 8), 1),
        35,
        98,
    )
    subject_attendance_average = clamp(
        round(attendance * 0.9 + random.uniform(-6, 6), 1),
        45,
        99,
    )

    performance_index = (
        attendance * 0.22
        + previous_marks * 0.24
        + assignment_score * 4.5
        + gpa * 5.2
        + study_hours * 3.8
        + subject_average * 0.19
        + subject_attendance_average * 0.1
        + random.uniform(-14, 14)
    )
    predicted_result = "At Risk" if performance_index < 118 else "On Track"

    return [
        department,
        semester,
        gender,
        age,
        course,
        gpa,
        credits_earned,
        attendance,
        study_hours,
        previous_marks,
        assignment_score,
        subject_average,
        subject_attendance_average,
        predicted_result,
    ]


def main():
    data = [generate_profile() for _ in range(1500)]
    df = pd.DataFrame(
        data,
        columns=[
            "Department",
            "Semester",
            "Gender",
            "Age",
            "Course",
            "GPA",
            "Credits Earned",
            "Attendance (%)",
            "Study Hours per Day",
            "Previous Marks (%)",
            "Assignment Score",
            "Subject Average (%)",
            "Subject Attendance Average (%)",
            "Predicted Result",
        ],
    )
    df.to_csv(DATASET_PATH, index=False)
    print("Generated updated academic dataset with 1500 rows.")


if __name__ == "__main__":
    main()
