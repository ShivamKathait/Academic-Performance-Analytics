import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { Student } from "../models/Student.js";
import { average, calculateRiskProfile, derivePredictionReasons } from "../utils/studentAnalytics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../../");
const predictScriptPath = path.join(serverRoot, "microservice", "predict.py");

const buildPredictionPayload = (student) => {
    const subjectAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.marks))
        : student.previousMarks;
    const subjectAttendanceAverage = student.subjects?.length
        ? average(student.subjects.map((subject) => subject.attendance))
        : student.attendance;

    return {
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
    };
};

const runPythonPrediction = (payload) => new Promise((resolve, reject) => {
    const py = spawn(process.env.PYTHON_BIN || "python3", [predictScriptPath, JSON.stringify(payload)], {
        cwd: serverRoot,
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
        stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
        stderr += data.toString();
    });

    py.on("error", (error) => {
        reject(error);
    });

    py.on("close", (code) => {
        const rawOutput = stdout.trim();

        if (code !== 0) {
            reject(new Error(stderr || `Python exited with code ${code}`));
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(rawOutput);
        } catch {
            reject(new Error(`Unexpected Python prediction output: ${rawOutput || "<empty>"}`));
            return;
        }

        if (!["On Track", "Needs Attention", "At Risk"].includes(parsed.prediction)) {
            reject(new Error(`Unexpected Python prediction output: ${parsed.prediction || "<empty>"}`));
            return;
        }

        resolve(parsed);
    });
});

export const predictStudentResult = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.studentId,
            teacher: req.teacher.id,
        });

        if (!student) {
            return res.status(404).json({ statusCode: 404, message: "Student not found" });
        }

        const riskProfile = calculateRiskProfile(student);
        const reasons = derivePredictionReasons(student);
        const predictionPayload = buildPredictionPayload(student);

        let predictedResult;
        let probabilities = null;

        try {
            const pythonResponse = await runPythonPrediction(predictionPayload);
            predictedResult = pythonResponse.prediction;
            probabilities = pythonResponse.probabilities || null;
        } catch (error) {
            console.error("Python prediction failed, using fallback:", error.message);
            predictedResult = riskProfile.predictedResult;
        }

        const outputResponse = {
            predictedResult,
            riskScore: riskProfile.riskScore,
            gpa: student.gpa,
            attendance: student.attendance,
            studyHours: student.studyHours,
            previousMarks: student.previousMarks,
            assignmentScore: student.assignmentScore,
            reasons,
            probabilities,
        };

        student.predictions.push(outputResponse);
        await student.save();

        res.status(200).json({
            statusCode: 200,
            message: "Prediction done successfully.",
            data: {
                studentName: student.name,
                prediction: outputResponse.predictedResult,
                riskScore: outputResponse.riskScore,
                reasons: outputResponse.reasons,
                probabilities: outputResponse.probabilities,
            }
        });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: error.message });
    }
};
