import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    code: String,
    name: {
        type: String,
        required: true
    },
    semester: Number,
    credits: {
        type: Number,
        default: 4
    },
    marks: {
        type: Number,
        min: 0,
        max: 100
    },
    attendance: {
        type: Number,
        min: 0,
        max: 100
    }
}, { _id: true });

const predictionSchema = new mongoose.Schema({
    attendance: Number,
    studyHours: Number,
    previousMarks: Number,
    assignmentScore: Number,
    gpa: Number,
    riskScore: Number,
    predictedResult: String,
    riskLevel: String,
    reasons: [String],
    probabilities: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    studentId: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    age: Number,
    course: {
        type: String,
        trim: true,
        default: 'B.Tech'
    },
    gpa: {
        type: Number,
        min: 0,
        max: 10
    },
    creditsEarned: {
        type: Number,
        default: 0
    },
    attendance: Number,
    studyHours: Number,
    previousMarks: Number,
    assignmentScore: Number,
    riskLevel: {
        type: String,
        default: 'Moderate'
    },
    subjects: [subjectSchema],
    predictions: [predictionSchema]
}, { timestamps: true });

export const Student = mongoose.model('Student', studentSchema);
