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
    const subjectAttendanceAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.attendance))
        : toNumber(student.attendance, 0);

    const normalizedGpa = Math.min(100, toNumber(student.gpa, 0) * 10);
    const attendance = Math.min(100, toNumber(student.attendance, 0));
    const studyHours = Math.min(100, toNumber(student.studyHours, 0) * 20);
    const assignmentScore = Math.min(100, toNumber(student.assignmentScore, 0) * 10);
    const previousMarks = Math.min(100, toNumber(student.previousMarks, 0));

    const supportAverage = (
        attendance +
        previousMarks +
        subjectAverage +
        subjectAttendanceAverage +
        assignmentScore +
        normalizedGpa
    ) / 6;

    const severeSignals = [
        attendance < 45,
        previousMarks < 45,
        subjectAverage < 45,
        subjectAttendanceAverage < 48,
        normalizedGpa < 50,
        assignmentScore < 45,
        toNumber(student.studyHours, 0) < 1,
    ].filter(Boolean).length;

    const readinessScore = Math.round(supportAverage * 100) / 100;
    const riskScore = Math.max(0, Math.min(100, Math.round(100 - supportAverage)));

    let predictedResult = 'On Track';
    if (supportAverage < 50 || severeSignals >= 3) {
        predictedResult = 'At Risk';
    } else if (supportAverage < 65 || severeSignals >= 1) {
        predictedResult = 'Needs Attention';
    }

    let riskLevel = 'Low';
    if (predictedResult === 'At Risk') {
        riskLevel = 'High';
    } else if (predictedResult === 'Needs Attention') {
        riskLevel = 'Moderate';
    }

    return {
        readinessScore,
        riskScore,
        riskLevel,
        predictedResult,
        subjectAverage: Math.round(subjectAverage * 100) / 100,
    };
};

export const derivePredictionReasons = (student = {}) => {
    const reasons = [];
    const subjectAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.marks))
        : average([student.previousMarks, student.assignmentScore * 10]);
    const subjectAttendanceAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.attendance))
        : toNumber(student.attendance, 0);

    const metrics = [
        {
            isWeak: toNumber(student.gpa, 0) < 6.5,
            message: `Low GPA (${toNumber(student.gpa, 0).toFixed(1)})`,
        },
        {
            isWeak: toNumber(student.attendance, 0) < 65,
            message: `Low attendance (${Math.round(toNumber(student.attendance, 0))}%)`,
        },
        {
            isWeak: toNumber(student.previousMarks, 0) < 60,
            message: `Low previous marks (${Math.round(toNumber(student.previousMarks, 0))}%)`,
        },
        {
            isWeak: toNumber(student.assignmentScore, 0) < 6,
            message: `Low assignment score (${toNumber(student.assignmentScore, 0).toFixed(1)}/10)`,
        },
        {
            isWeak: toNumber(student.studyHours, 0) < 2,
            message: `Low study hours (${toNumber(student.studyHours, 0).toFixed(1)} hrs/day)`,
        },
        {
            isWeak: subjectAverage < 60,
            message: `Low subject average (${Math.round(subjectAverage)}%)`,
        },
        {
            isWeak: subjectAttendanceAverage < 65,
            message: `Low subject attendance (${Math.round(subjectAttendanceAverage)}%)`,
        },
        {
            isWeak: toNumber(student.creditsEarned, 0) < 20,
            message: `Low credits earned (${Math.round(toNumber(student.creditsEarned, 0))})`,
        },
    ];

    metrics.forEach((metric) => {
        if (metric.isWeak) {
            reasons.push(metric.message);
        }
    });

    if (!reasons.length) {
        reasons.push("Performance indicators are currently stable");
    }

    return reasons.slice(0, 4);
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
