import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { buildStudentPayload, calculateRiskProfile } from '../utils/studentAnalytics.js';

export const addStudent = async (req, res) => {
    try {
        const student = new Student({
            teacher: req.teacher.id, // set via protect middleware
            ...buildStudentPayload(req.body),
        });

        await student.save();
        res.status(201).json({
            statusCode: 201,
            message: "Student added successfully",
            data: student
        });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: error.message });
    }
};

export const updateStudentData = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payload = buildStudentPayload(req.body);

        const student = await Student.findOneAndUpdate(
            { _id: studentId, teacher: req.teacher.id },
            payload,
            { new: true }
        );

        if (!student) return res.status(404).json({ statusCode: 404, message: "Student not found or unauthorized" });

        res.status(200).json({ statusCode: 200, message: "Student updated successfully", data: student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ statusCode: 500, message: "Something went wrong" });
    }
};

export const getStudents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            name = '',
            department = '',
            semester = '',
            gender = '',
            subject = '',
            riskLevel = '',
        } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const matchStage = {
            teacher: new mongoose.Types.ObjectId(req.teacher.id),
            name: { $regex: name, $options: 'i' } // Case-insensitive search
        };
        if (department) matchStage.department = { $regex: department, $options: 'i' };
        if (semester) matchStage.semester = Number(semester);
        if (gender) matchStage.gender = { $regex: gender, $options: 'i' };
        if (riskLevel) matchStage.riskLevel = riskLevel;
        if (subject) matchStage['subjects.name'] = { $regex: subject, $options: 'i' };

        const students = await Student.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    predictions: {
                        $sortArray: {
                            input: "$predictions",
                            sortBy: { createdAt: -1 }
                        }
                    }
                }
            },
            { $sort: { name: 1 } }, // Optional: sort alphabetically by name
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const total = await Student.countDocuments(matchStage);
        const enrichedStudents = students.map((student) => {
            const riskProfile = calculateRiskProfile(student);
            return {
                ...student,
                analyticsRisk: riskProfile,
                riskLevel: student.riskLevel || riskProfile.riskLevel,
            };
        });

        res.status(200).json({
            statusCode: 200,
            message: 'Students list fetched',
            data: enrichedStudents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: error.message });
    }
};

export const getStudentDetails = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.studentId,
            teacher: req.teacher.id,
        }).lean();

        if (!student) return res.status(404).json({ statusCode: 404, message: "Student not found" });
        const riskProfile = calculateRiskProfile(student);

        res.status(200).json({
            statusCode: 200,
            message: 'Student details fetched',
            data: {
                ...student,
                analyticsRisk: riskProfile,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ statusCode: 500, message: "Something went wrong" });
    }
};
