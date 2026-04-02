import { Student } from '../models/Student.js';
import { average, calculateRiskProfile } from '../utils/studentAnalytics.js';

const regexFilter = (value) => value ? { $regex: value, $options: 'i' } : undefined;

const buildMatchStage = (teacherId, query = {}) => {
    const match = { teacher: teacherId };

    if (query.department) match.department = regexFilter(query.department);
    if (query.gender) match.gender = regexFilter(query.gender);
    if (query.semester) match.semester = Number(query.semester);
    if (query.riskLevel) match.riskLevel = query.riskLevel;
    if (query.name) match.name = regexFilter(query.name);
    if (query.subject) match['subjects.name'] = regexFilter(query.subject);

    return match;
};

const getLatestPrediction = (student) => {
    if (!student.predictions?.length) return null;
    return [...student.predictions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
};

export const getDashboardAnalytics = async (req, res) => {
    try {
        const match = buildMatchStage(req.teacher.id, req.query);
        const students = await Student.find(match).lean();

        const enrichedStudents = students.map((student) => {
            const riskProfile = calculateRiskProfile(student);
            const latestPrediction = getLatestPrediction(student) || {
                predictedResult: riskProfile.predictedResult,
                riskLevel: riskProfile.riskLevel,
                riskScore: riskProfile.riskScore,
            };

            return {
                ...student,
                latestPrediction,
                analyticsRisk: riskProfile,
            };
        });

        const totalStudents = enrichedStudents.length;
        const avgAttendance = average(enrichedStudents.map((student) => student.attendance));
        const avgGpa = average(enrichedStudents.map((student) => student.gpa));
        const avgMarks = average(enrichedStudents.flatMap((student) => student.subjects?.map((subject) => subject.marks) || [student.previousMarks]));
        const atRiskStudents = enrichedStudents.filter((student) => student.analyticsRisk.riskLevel === 'High');
        const onTrackCount = enrichedStudents.filter((student) => student.analyticsRisk.predictedResult === 'On Track').length;
        const passRate = totalStudents ? (onTrackCount / totalStudents) * 100 : 0;

        const departmentMap = new Map();
        const semesterMap = new Map();
        const subjectMap = new Map();
        const riskDistribution = { Low: 0, Moderate: 0, High: 0 };
        const genderDistribution = {};
        const attendanceCorrelation = [];

        for (const student of enrichedStudents) {
            const deptKey = student.department || 'Unknown';
            const deptBucket = departmentMap.get(deptKey) || { department: deptKey, students: 0, totalGpa: 0, totalAttendance: 0, atRisk: 0 };
            deptBucket.students += 1;
            deptBucket.totalGpa += Number(student.gpa || 0);
            deptBucket.totalAttendance += Number(student.attendance || 0);
            if (student.analyticsRisk.riskLevel === 'High') deptBucket.atRisk += 1;
            departmentMap.set(deptKey, deptBucket);

            const semesterKey = `${student.semester || 0}`;
            const semBucket = semesterMap.get(semesterKey) || { semester: Number(student.semester || 0), students: 0, totalGpa: 0, totalAttendance: 0, totalRisk: 0 };
            semBucket.students += 1;
            semBucket.totalGpa += Number(student.gpa || 0);
            semBucket.totalAttendance += Number(student.attendance || 0);
            semBucket.totalRisk += Number(student.analyticsRisk.riskScore || 0);
            semesterMap.set(semesterKey, semBucket);

            riskDistribution[student.analyticsRisk.riskLevel] += 1;
            genderDistribution[student.gender] = (genderDistribution[student.gender] || 0) + 1;

            const studentAvgMarks = student.subjects?.length
                ? average(student.subjects.map((subject) => subject.marks))
                : Number(student.previousMarks || 0);

            attendanceCorrelation.push({
                id: student._id,
                name: student.name,
                attendance: Number(student.attendance || 0),
                marks: Math.round(studentAvgMarks),
                riskLevel: student.analyticsRisk.riskLevel,
            });

            for (const subject of student.subjects || []) {
                const subjectKey = `${subject.name}-${subject.semester || student.semester || 0}`;
                const subjectBucket = subjectMap.get(subjectKey) || {
                    name: subject.name,
                    code: subject.code,
                    semester: Number(subject.semester || student.semester || 0),
                    entries: 0,
                    totalMarks: 0,
                    totalAttendance: 0,
                };

                subjectBucket.entries += 1;
                subjectBucket.totalMarks += Number(subject.marks || 0);
                subjectBucket.totalAttendance += Number(subject.attendance || 0);
                subjectMap.set(subjectKey, subjectBucket);
            }
        }

        const departmentPerformance = [...departmentMap.values()]
            .map((item) => ({
                department: item.department,
                students: item.students,
                avgGpa: item.students ? Number((item.totalGpa / item.students).toFixed(2)) : 0,
                avgAttendance: item.students ? Number((item.totalAttendance / item.students).toFixed(1)) : 0,
                atRisk: item.atRisk,
            }))
            .sort((a, b) => b.students - a.students);

        const semesterTrend = [...semesterMap.values()]
            .map((item) => ({
                semester: item.semester,
                students: item.students,
                avgGpa: item.students ? Number((item.totalGpa / item.students).toFixed(2)) : 0,
                avgAttendance: item.students ? Number((item.totalAttendance / item.students).toFixed(1)) : 0,
                avgRisk: item.students ? Number((item.totalRisk / item.students).toFixed(1)) : 0,
            }))
            .sort((a, b) => a.semester - b.semester);

        const subjectAnalytics = [...subjectMap.values()]
            .map((item) => ({
                name: item.name,
                code: item.code,
                semester: item.semester,
                avgMarks: item.entries ? Number((item.totalMarks / item.entries).toFixed(1)) : 0,
                avgAttendance: item.entries ? Number((item.totalAttendance / item.entries).toFixed(1)) : 0,
                entries: item.entries,
            }))
            .sort((a, b) => b.avgMarks - a.avgMarks);

        const topRiskStudents = atRiskStudents
            .sort((a, b) => b.analyticsRisk.riskScore - a.analyticsRisk.riskScore)
            .slice(0, 8)
            .map((student) => ({
                _id: student._id,
                name: student.name,
                studentId: student.studentId,
                department: student.department,
                semester: student.semester,
                gpa: student.gpa,
                attendance: student.attendance,
                riskScore: student.analyticsRisk.riskScore,
                riskLevel: student.analyticsRisk.riskLevel,
            }));

        res.status(200).json({
            statusCode: 200,
            message: 'Academic analytics fetched successfully',
            data: {
                summary: {
                    totalStudents,
                    avgAttendance: Number(avgAttendance.toFixed(1)),
                    avgGpa: Number(avgGpa.toFixed(2)),
                    avgMarks: Number(avgMarks.toFixed(1)),
                    passRate: Number(passRate.toFixed(1)),
                    atRiskCount: atRiskStudents.length,
                },
                departmentPerformance,
                semesterTrend,
                subjectAnalytics,
                riskDistribution,
                genderDistribution,
                attendanceCorrelation,
                topRiskStudents,
            }
        });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: error.message });
    }
};
