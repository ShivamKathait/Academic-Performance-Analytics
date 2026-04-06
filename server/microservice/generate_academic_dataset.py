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


def build_support_average(profile):
    return (
        profile["attendance"]
        + profile["previous_marks"]
        + profile["subject_average"]
        + profile["subject_attendance_average"]
        + (profile["assignment_score"] * 10)
        + (profile["gpa"] * 10)
    ) / 6


def count_severe_signals(profile):
    return sum([
        profile["attendance"] < 45,
        profile["previous_marks"] < 45,
        profile["subject_average"] < 45,
        profile["subject_attendance_average"] < 48,
        profile["gpa"] < 5.0,
        profile["assignment_score"] < 4.5,
        profile["study_hours"] < 1.0,
    ])


def classify_performance(profile):
    support_average = build_support_average(profile)
    severe_signals = count_severe_signals(profile)

    if support_average < 50 or severe_signals >= 3:
        return "At Risk"
    if support_average < 65 or severe_signals >= 1:
        return "Needs Attention"
    return "On Track"


def generate_profile():
    department = random.choice(DEPARTMENTS)
    semester = random.randint(1, 8)
    gender = random.choice(GENDERS)
    age = random.randint(17, 25)
    course = random.choice(COURSES)
    attendance = random.randint(40, 98)
    study_hours = round(random.uniform(0.5, 6.5), 1)
    previous_marks = random.randint(35, 96)
    assignment_score = round(random.uniform(3.0, 10.0), 1)
    gpa = round(random.uniform(4.5, 9.7), 1)
    credits_earned = random.randint(12, 28) + (semester - 1) * 4

    subject_average = clamp(
        round(previous_marks * 0.58 + attendance * 0.14 + gpa * 3.2 + study_hours * 2.2 + random.uniform(-10, 10), 1),
        30,
        98,
    )
    subject_attendance_average = clamp(
        round(attendance * 0.92 + random.uniform(-7, 7), 1),
        40,
        99,
    )

    profile = {
        "attendance": attendance,
        "study_hours": study_hours,
        "previous_marks": previous_marks,
        "assignment_score": assignment_score,
        "gpa": gpa,
        "subject_average": subject_average,
        "subject_attendance_average": subject_attendance_average,
    }
    predicted_result = classify_performance(profile)

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
    data = [generate_profile() for _ in range(2400)]
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
    print("Generated academic dataset using 50-65-65+ policy bands.")
    print(df["Predicted Result"].value_counts().to_string())


if __name__ == "__main__":
    main()
