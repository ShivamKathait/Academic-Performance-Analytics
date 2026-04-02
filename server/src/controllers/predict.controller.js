import { Student } from "../models/Student.js";
import { spawn } from "child_process";
import { average, calculateRiskProfile } from "../utils/studentAnalytics.js";

export const predictStudentResult = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.studentId,
            teacher: req.teacher.id,
        });

        if (!student) {
            return res.status(404).json({ statusCode: 404, message: "Student not found" });
        }

        let responseSent = false;

        const fallbackPrediction = async () => {
            if (responseSent) return;
            responseSent = true;
            const riskProfile = calculateRiskProfile(student);
            const outputResponse = {
                predictedResult: riskProfile.predictedResult,
                riskLevel: riskProfile.riskLevel,
                riskScore: riskProfile.riskScore,
                gpa: student.gpa,
                attendance: student.attendance,
                studyHours: student.studyHours,
                previousMarks: student.previousMarks,
                assignmentScore: student.assignmentScore,
            };

            student.riskLevel = riskProfile.riskLevel;
            student.predictions.push(outputResponse);
            await student.save();

            res.status(200).json({
                statusCode: 200,
                message: `Prediction done successfully.`,
                data: {
                    studentName: student.name,
                    prediction: outputResponse.predictedResult,
                    riskLevel: outputResponse.riskLevel,
                    riskScore: outputResponse.riskScore,
                }
            });
        };

        const subjectAverage = student.subjects?.length
            ? average(student.subjects.map((subject) => subject.marks))
            : student.previousMarks;
        const subjectAttendanceAverage = student.subjects?.length
            ? average(student.subjects.map((subject) => subject.attendance))
            : student.attendance;

        const predictionPayload = JSON.stringify({
            Department: student.department,
            Semester: Number(student.semester || 1),
            Gender: student.gender,
            Age: Number(student.age || 0),
            Course: student.course,
            GPA: Number(student.gpa || 0),
            "Credits Earned": Number(student.creditsEarned || 0),
            "Attendance (%)": Number(student.attendance || 0),
            "Study Hours per Day": Number(student.studyHours || 0),
            "Previous Marks (%)": Number(student.previousMarks || 0),
            "Assignment Score": Number(student.assignmentScore || 0),
            "Subject Average (%)": Number(subjectAverage || 0),
            "Subject Attendance Average (%)": Number(subjectAttendanceAverage || 0),
        });

        const py = spawn(process.env.PYTHON_BIN || "python3", [
            "./microservice/predict.py",
            predictionPayload,
        ]);

        let output = "";
        let stderrOutput = "";

        py.stdout.on("data", (data) => {
            output += data.toString();
        });

        py.stderr.on("data", (err) => {
            stderrOutput += err.toString();
            console.error("Python error:", err.toString());
        });

        py.on("error", async () => {
            await fallbackPrediction();
        });

        py.on("close", async (code) => {
            if (code !== 0 || stderrOutput) {
                await fallbackPrediction();
                return;
            }

            if (responseSent) return;
            responseSent = true;

            const riskProfile = calculateRiskProfile(student);
            // Save prediction
            let outputResponse = {
                predictedResult: output.trim(),
                riskLevel: riskProfile.riskLevel,
                riskScore: riskProfile.riskScore,
                gpa: student.gpa,
                attendance: student.attendance,
                studyHours: student.studyHours,
                previousMarks: student.previousMarks,
                assignmentScore: student.assignmentScore,
            };
            student.riskLevel = riskProfile.riskLevel;
            student.predictions.push(outputResponse);
            await student.save();

            res.status(200).json({
                statusCode: 200,
                message: `Prediction done successfully.`,
                data: {
                    studentName: student.name,
                    prediction: outputResponse.predictedResult,
                    riskLevel: outputResponse.riskLevel,
                    riskScore: outputResponse.riskScore,
                }
            });
        });

    } catch (error) {
        res.status(500).json({ statusCode: 500, message: error.message });
    }
};
