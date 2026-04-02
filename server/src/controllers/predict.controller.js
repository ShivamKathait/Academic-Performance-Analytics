import { Student } from "../models/Student.js";
import { spawn } from "child_process";
import { calculateRiskProfile } from "../utils/studentAnalytics.js";

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

        const py = spawn("python", [
            "./microservice/predict.py",
            student.attendance,
            student.studyHours,
            student.previousMarks,
            student.assignmentScore,
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
