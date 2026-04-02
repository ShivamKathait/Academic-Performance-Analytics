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

export const SUBJECT_TEMPLATES_BY_DEPARTMENT = {
  "Computer Science": {
    1: [
      { code: "CSE101", name: "Programming Fundamentals", credits: 4 },
      { code: "CSE102", name: "Engineering Mathematics", credits: 4 },
      { code: "CSE103", name: "Digital Logic", credits: 3 },
      { code: "CSE104", name: "Computer Fundamentals Lab", credits: 2 },
    ],
    2: [
      { code: "CSE201", name: "Data Structures", credits: 4 },
      { code: "CSE202", name: "Discrete Mathematics", credits: 4 },
      { code: "CSE203", name: "Object-Oriented Programming", credits: 4 },
      { code: "CSE204", name: "Data Structures Lab", credits: 2 },
    ],
    default: [
      { code: "CSE301", name: "Database Systems", credits: 4 },
      { code: "CSE302", name: "Operating Systems", credits: 4 },
      { code: "CSE303", name: "Computer Networks", credits: 4 },
      { code: "CSE304", name: "Software Engineering", credits: 3 },
    ],
  },
  "Information Technology": {
    1: [
      { code: "ITE101", name: "IT Foundations", credits: 4 },
      { code: "ITE102", name: "Mathematics for IT", credits: 4 },
      { code: "ITE103", name: "Web Basics", credits: 3 },
      { code: "ITE104", name: "IT Skills Lab", credits: 2 },
    ],
    2: [
      { code: "ITE201", name: "Web Engineering", credits: 4 },
      { code: "ITE202", name: "Database Management", credits: 4 },
      { code: "ITE203", name: "Java Programming", credits: 4 },
      { code: "ITE204", name: "Networking Basics", credits: 3 },
    ],
    default: [
      { code: "ITE301", name: "Cloud Computing", credits: 4 },
      { code: "ITE302", name: "Information Security", credits: 4 },
      { code: "ITE303", name: "Data Analytics", credits: 4 },
      { code: "ITE304", name: "Mobile App Development", credits: 3 },
    ],
  },
  Electronics: {
    1: [
      { code: "ECE101", name: "Basic Electronics", credits: 4 },
      { code: "ECE102", name: "Engineering Physics", credits: 4 },
      { code: "ECE103", name: "Circuit Theory", credits: 3 },
      { code: "ECE104", name: "Electronics Workshop", credits: 2 },
    ],
    2: [
      { code: "ECE201", name: "Digital Electronics", credits: 4 },
      { code: "ECE202", name: "Signals and Systems", credits: 4 },
      { code: "ECE203", name: "Analog Circuits", credits: 4 },
      { code: "ECE204", name: "Network Analysis", credits: 3 },
    ],
    default: [
      { code: "ECE301", name: "Microprocessors", credits: 4 },
      { code: "ECE302", name: "Communication Systems", credits: 4 },
      { code: "ECE303", name: "Control Systems", credits: 4 },
      { code: "ECE304", name: "VLSI Design", credits: 3 },
    ],
  },
  Mechanical: {
    1: [
      { code: "MEC101", name: "Engineering Mechanics", credits: 4 },
      { code: "MEC102", name: "Applied Mathematics", credits: 4 },
      { code: "MEC103", name: "Engineering Graphics", credits: 3 },
      { code: "MEC104", name: "Workshop Practice", credits: 2 },
    ],
    2: [
      { code: "MEC201", name: "Thermodynamics", credits: 4 },
      { code: "MEC202", name: "Fluid Mechanics", credits: 4 },
      { code: "MEC203", name: "Material Science", credits: 4 },
      { code: "MEC204", name: "Manufacturing Processes", credits: 3 },
    ],
    default: [
      { code: "MEC301", name: "Machine Design", credits: 4 },
      { code: "MEC302", name: "Heat Transfer", credits: 4 },
      { code: "MEC303", name: "Dynamics of Machines", credits: 4 },
      { code: "MEC304", name: "Industrial Engineering", credits: 3 },
    ],
  },
  Civil: {
    1: [
      { code: "CIV101", name: "Engineering Drawing", credits: 3 },
      { code: "CIV102", name: "Construction Materials", credits: 4 },
      { code: "CIV103", name: "Applied Mechanics", credits: 4 },
      { code: "CIV104", name: "Civil Workshop", credits: 2 },
    ],
    2: [
      { code: "CIV201", name: "Surveying", credits: 4 },
      { code: "CIV202", name: "Structural Analysis", credits: 4 },
      { code: "CIV203", name: "Fluid Mechanics", credits: 4 },
      { code: "CIV204", name: "Geology for Engineers", credits: 3 },
    ],
    default: [
      { code: "CIV301", name: "Geotechnical Engineering", credits: 4 },
      { code: "CIV302", name: "Transportation Engineering", credits: 4 },
      { code: "CIV303", name: "Environmental Engineering", credits: 4 },
      { code: "CIV304", name: "Concrete Technology", credits: 3 },
    ],
  },
  "Business Analytics": {
    1: [
      { code: "BAN101", name: "Business Statistics", credits: 4 },
      { code: "BAN102", name: "Accounting Fundamentals", credits: 4 },
      { code: "BAN103", name: "Spreadsheet Modelling", credits: 3 },
      { code: "BAN104", name: "Managerial Communication", credits: 2 },
    ],
    2: [
      { code: "BAN201", name: "Predictive Modelling", credits: 4 },
      { code: "BAN202", name: "Data Visualization", credits: 4 },
      { code: "BAN203", name: "Financial Analytics", credits: 4 },
      { code: "BAN204", name: "Business Research", credits: 3 },
    ],
    default: [
      { code: "BAN301", name: "Machine Learning for Business", credits: 4 },
      { code: "BAN302", name: "Marketing Analytics", credits: 4 },
      { code: "BAN303", name: "Operations Analytics", credits: 4 },
      { code: "BAN304", name: "Decision Science", credits: 3 },
    ],
  },
};

const normalizeSubjectTemplate = (subject, semester) => ({
  ...subject,
  semester,
  marks: "",
  attendance: "",
});

export const createDefaultSubjects = (semester = 1, department = DEPARTMENTS[0]) => {
  const departmentTemplates = SUBJECT_TEMPLATES_BY_DEPARTMENT[department] || SUBJECT_TEMPLATES_BY_DEPARTMENT[DEPARTMENTS[0]];
  const subjectTemplates = departmentTemplates[semester] || departmentTemplates.default;

  return subjectTemplates.map((subject) => normalizeSubjectTemplate(subject, semester));
};
