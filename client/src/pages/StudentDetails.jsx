// import React, { useEffect, useState } from 'react';
// import API from '../services/api';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { notifyError, notifySuccess } from '../services/toastNotifications';
// import { Card, CardContent, Typography, Button, CircularProgress, Container, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// function StudentDetails() {
//     const { id } = useParams();

//     useEffect(() => {
//         const fetchStudentDetails = async () => {
//             try {
//                 const response = await API.get(`/students/${id}`);
//                 console.log(`response`, response);
//                 // if (response?.data?.code === 200) {
//                 //     setPost(response?.data?.data);
//                 // } else {
//                 //     notifyError(response?.data?.message);
//                 // }
//             } catch (err) {
//                 notifyError(err?.response?.data?.message || 'Failed to student details');
//                 console.error('Failed to student details', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchStudentDetails();
//     }, [id]);


//     return (

//     );
// }

// export default StudentDetails;


import React, { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Container, Box,
    CardActions,
    Button,
    Chip,
    Grid,
    Stack
} from '@mui/material';
import { notifyError, notifySuccess } from '../services/toastNotifications';

function StudentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPrediction, setLoadingPrediction] = useState(false);

    const fetchStudentDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get(`/students/${id}`);
            if (response?.data?.statusCode === 200) {
                setStudent(response?.data?.data);
            } else {
                notifyError(response?.data?.message);
            }
        } catch (err) {
            notifyError(err?.response?.data?.message || 'Failed to fetch student details');
        } finally {
            setLoading(false);
        }
    }, [id]);


    // Handle Predict Result
    const handlePredictResult = async () => {
        setLoadingPrediction(true);

        try {
            const response = await API.post(`/predict/${id}`);
            const { message, data } = response?.data || {};

            if (response?.data?.statusCode === 200) {
                notifySuccess(`${message} → ${data?.studentName}: ${data?.prediction}`);
                fetchStudentDetails();
            } else {
                notifyError(message || 'An error occurred while predicting the result');
            }
        } catch (error) {
            notifyError(error?.response?.data?.message || 'An error occurred while predicting the result');
        } finally {
            setLoadingPrediction(false);
        }
    };

    useEffect(() => {
        const loadStudent = async () => {
            await fetchStudentDetails();
        };

        loadStudent();
    }, [fetchStudentDetails]);

    if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
    if (!student) return null;

    const risk = student.analyticsRisk || {};
    const latestPrediction = student.predictions?.length ? student.predictions[student.predictions.length - 1] : null;
    const currentPrediction = latestPrediction?.predictedResult || risk.predictedResult || 'Needs Attention';
    const getPredictionColor = (prediction) => {
        if (prediction === 'At Risk' || prediction === 'Fail') return '#c62828';
        if (prediction === 'Needs Attention') return '#ef6c00';
        return '#2e7d32';
    };
    const formatProbability = (value) => typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '--';
    const probabilityOrder = ['At Risk', 'Needs Attention', 'On Track'];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Card sx={{ mb: 4, borderRadius: 4 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap" mb={2}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">{student.department} • Semester {student.semester}</Typography>
                            <Typography variant="h4" gutterBottom>{student.name}</Typography>
                            <Typography color="text.secondary">Student ID: {student.studentId || 'N/A'}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="start">
                            <Chip label={currentPrediction} sx={{ color: 'white', bgcolor: getPredictionColor(currentPrediction) }} />
                            <Chip label={`${risk.riskScore || 0} Risk Score`} variant="outlined" />
                            {latestPrediction?.probabilities ? <Chip label={`Confidence ${formatProbability(latestPrediction.probabilities[currentPrediction])}`} variant="outlined" /> : null}
                        </Stack>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}><Typography><strong>Gender:</strong> {student.gender}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Age:</strong> {student.age}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Course:</strong> {student.course}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Credits Earned:</strong> {student.creditsEarned}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Attendance:</strong> {student.attendance}%</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Study Hours:</strong> {student.studyHours} hrs</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Previous Marks:</strong> {student.previousMarks}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>GPA:</strong> {student.gpa}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Assignment Score:</strong> {student.assignmentScore}/10</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Readiness Score:</strong> {risk.readinessScore || 0}</Typography></Grid>
                        <Grid item xs={12} md={3}><Typography><strong>Subject Avg:</strong> {risk.subjectAverage || 0}</Typography></Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'end', px: 2 }}>
                    <Button size="small" variant="contained" color="primary"
                        onClick={() => navigate(`/students/edit/${id}`)}
                    >
                        Edit Details
                    </Button>
                    <Button size="small" variant="contained" color="primary"
                        onClick={() => handlePredictResult()}
                        disabled={loadingPrediction}
                    >
                        {loadingPrediction ? 'Predicting...' : 'Predict Result'}
                    </Button>
                </CardActions>
            </Card>

            <Typography variant="h6" gutterBottom>Subject Analytics</Typography>
            <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 4 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Semester</TableCell>
                            <TableCell>Credits</TableCell>
                            <TableCell>Marks</TableCell>
                            <TableCell>Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(student.subjects || []).map((subject) => (
                            <TableRow key={subject._id || subject.code}>
                                <TableCell>{subject.code}</TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell>{subject.semester}</TableCell>
                                <TableCell>{subject.credits}</TableCell>
                                <TableCell>{subject.marks}</TableCell>
                                <TableCell>{subject.attendance}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom>Prediction History</Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Attendance</TableCell>
                            <TableCell>Study Hours</TableCell>
                            <TableCell>Previous Marks</TableCell>
                            <TableCell>Assignment Score</TableCell>
                            <TableCell>Risk Score</TableCell>
                            <TableCell>Reasons</TableCell>
                            <TableCell>Probabilities</TableCell>
                            <TableCell>Predicted Result</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {student.predictions.slice().reverse().map(pred => (
                            <TableRow key={pred._id}>
                                <TableCell>{new Date(pred.createdAt).toLocaleString()}</TableCell>
                                <TableCell>{pred.attendance}%</TableCell>
                                <TableCell>{pred.studyHours}</TableCell>
                                <TableCell>{pred.previousMarks}</TableCell>
                                <TableCell>{pred.assignmentScore}</TableCell>
                                <TableCell>{pred.riskScore ?? '--'}</TableCell>
                                <TableCell sx={{ maxWidth: 320 }}>
                                    {Array.isArray(pred.reasons) && pred.reasons.length ? (
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                            {pred.reasons.map((reason) => (
                                                <Chip
                                                    key={`${pred._id}-${reason}`}
                                                    label={reason}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            ))}
                                        </Stack>
                                    ) : '--'}
                                </TableCell>
                                <TableCell sx={{ minWidth: 220 }}>
                                    {pred.probabilities ? (
                                        <Stack spacing={0.75}>
                                            {probabilityOrder.map((label) => (
                                                <Box key={`${pred._id}-${label}`}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
                                                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                                                        <Typography variant="caption" fontWeight={700}>{formatProbability(pred.probabilities[label])}</Typography>
                                                    </Box>
                                                    <Box sx={{ height: 6, borderRadius: 999, bgcolor: 'rgba(15, 23, 42, 0.08)', overflow: 'hidden' }}>
                                                        <Box
                                                            sx={{
                                                                width: formatProbability(pred.probabilities[label]),
                                                                height: '100%',
                                                                borderRadius: 999,
                                                                bgcolor: getPredictionColor(label),
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : '--'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={pred.predictedResult}
                                        size="small"
                                        sx={{ color: 'white', bgcolor: getPredictionColor(pred.predictedResult), fontWeight: 700 }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {!student.predictions.length ?
                <Typography variant="h6" sx={{ display: `flex`, justifyContent: 'center', marginTop: '10px' }} gutterBottom>No Prediction History</Typography>
                : ''}
        </Container>
    );
}

export default StudentDetails;
