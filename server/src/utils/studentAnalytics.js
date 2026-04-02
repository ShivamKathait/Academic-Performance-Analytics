const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeSubject = (subject = {}, index = 0, semesterFallback = 1) => ({
    code: `${subject.code || `SUB-${index + 1}`}`.trim(),
    name: `${subject.name || `Subject ${index + 1}`}`.trim(),
    semester: toNumber(subject.semester, semesterFallback),
    credits: toNumber(subject.credits, 4),
    marks: Math.min(100, Math.max(0, toNumber(subject.marks, 0))),
    attendance: Math.min(100, Math.max(0, toNumber(subject.attendance, 0))),
});

export const average = (values = []) => {
    const nums = values.map((value) => toNumber(value)).filter((value) => Number.isFinite(value));
    if (!nums.length) return 0;
    return nums.reduce((sum, value) => sum + value, 0) / nums.length;
};

export const calculateRiskProfile = (student = {}) => {
    const subjectAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.marks))
        : average([student.previousMarks, student.assignmentScore * 10]);

    const normalizedGpa = Math.min(100, toNumber(student.gpa, 0) * 10);
    const attendance = Math.min(100, toNumber(student.attendance, 0));
    const studyHours = Math.min(100, toNumber(student.studyHours, 0) * 20);
    const assignmentScore = Math.min(100, toNumber(student.assignmentScore, 0) * 10);
    const previousMarks = Math.min(100, toNumber(student.previousMarks, 0));

    const readinessScore = (
        attendance * 0.25 +
        previousMarks * 0.2 +
        assignmentScore * 0.15 +
        normalizedGpa * 0.2 +
        studyHours * 0.1 +
        subjectAverage * 0.1
    );

    const riskScore = Math.max(0, Math.min(100, Math.round(100 - readinessScore)));
    let riskLevel = 'Low';

    if (riskScore >= 65) {
        riskLevel = 'High';
    } else if (riskScore >= 35) {
        riskLevel = 'Moderate';
    }

    const predictedResult = riskScore >= 55 ? 'At Risk' : 'On Track';

    return {
        readinessScore: Math.round(readinessScore * 100) / 100,
        riskScore,
        riskLevel,
        predictedResult,
        subjectAverage: Math.round(subjectAverage * 100) / 100,
    };
};

export const buildStudentPayload = (payload = {}) => {
    const semester = toNumber(payload.semester, 1);
    const subjects = Array.isArray(payload.subjects) && payload.subjects.length
        ? payload.subjects.map((subject, index) => normalizeSubject(subject, index, semester))
        : [];

    const student = {
        name: `${payload.name || ''}`.trim(),
        studentId: `${payload.studentId || ''}`.trim(),
        department: `${payload.department || ''}`.trim(),
        semester,
        gender: `${payload.gender || ''}`.trim(),
        age: toNumber(payload.age, 0),
        course: `${payload.course || 'B.Tech'}`.trim(),
        gpa: toNumber(payload.gpa, 0),
        creditsEarned: toNumber(payload.creditsEarned, 0),
        attendance: Math.min(100, Math.max(0, toNumber(payload.attendance, 0))),
        studyHours: Math.max(0, toNumber(payload.studyHours, 0)),
        previousMarks: Math.min(100, Math.max(0, toNumber(payload.previousMarks, 0))),
        assignmentScore: Math.min(10, Math.max(0, toNumber(payload.assignmentScore, 0))),
        subjects,
    };

    const riskProfile = calculateRiskProfile(student);

    return {
        ...student,
        riskLevel: riskProfile.riskLevel,
    };
};
