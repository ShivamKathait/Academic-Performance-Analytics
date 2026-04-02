export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business Analytics",
];

export const GENDERS = ["Male", "Female", "Non-binary"];

export const COURSES = ["B.Tech", "BCA", "MCA", "MBA", "B.Sc"];

export const SUBJECT_TEMPLATES = [
  { code: "MTH101", name: "Engineering Mathematics", credits: 4 },
  { code: "CSE102", name: "Data Structures", credits: 4 },
  { code: "CSE103", name: "Database Systems", credits: 4 },
  { code: "CSE104", name: "Computer Networks", credits: 3 },
];

export const createDefaultSubjects = (semester = 1) =>
  SUBJECT_TEMPLATES.map((subject) => ({
    ...subject,
    semester,
    marks: "",
    attendance: "",
  }));
