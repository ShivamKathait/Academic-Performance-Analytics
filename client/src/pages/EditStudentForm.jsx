import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { TextField, Button, Container, Typography, Grid, MenuItem, Paper, Stack } from '@mui/material';
import { notifyError, notifySuccess } from '../services/toastNotifications';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES, createDefaultSubjects, DEPARTMENTS, GENDERS } from '../constants';

const EditStudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState({
    studentId: '',
    name: '',
    department: DEPARTMENTS[0],
    semester: 1,
    gender: GENDERS[0],
    age: '',
    course: COURSES[0],
    gpa: '',
    creditsEarned: '',
    attendance: '',
    studyHours: '',
    previousMarks: '',
    assignmentScore: '',
    subjects: createDefaultSubjects(1, DEPARTMENTS[0]),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const previousAcademicSelection = useRef({
    department: DEPARTMENTS[0],
    semester: 1,
  });


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await API.get(`/students/${id}`);
        const data = response?.data?.data;
        previousAcademicSelection.current = {
          department: data?.department || DEPARTMENTS[0],
          semester: data?.semester || 1,
        };
        setInitialValues({
          studentId: data?.studentId || '',
          name: data?.name || '',
          department: data?.department || DEPARTMENTS[0],
          semester: data?.semester || 1,
          gender: data?.gender || GENDERS[0],
          age: data?.age || '',
          course: data?.course || COURSES[0],
          gpa: data?.gpa || '',
          creditsEarned: data?.creditsEarned || '',
          attendance: data?.attendance || '',
          studyHours: data?.studyHours || '',
          previousMarks: data?.previousMarks || '',
          assignmentScore: data?.assignmentScore || '',
          subjects: data?.subjects?.length ? data.subjects : createDefaultSubjects(data?.semester || 1, data?.department || DEPARTMENTS[0]),
        });
      } catch (err) {
        notifyError(err?.response?.data?.message || 'Failed to fetch student');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const validationSchema = Yup.object({
    studentId: Yup.string().required('Student ID is required'),
    name: Yup.string().required('Name is required'),
    department: Yup.string().required('Department is required'),
    semester: Yup.number().min(1).max(8).required('Semester is required'),
    gender: Yup.string().required('Gender is required'),
    age: Yup.number().min(15).max(60).required('Age is required'),
    course: Yup.string().required('Course is required'),
    gpa: Yup.number().min(0).max(10).required('GPA is required'),
    creditsEarned: Yup.number().min(0).required('Credits are required'),
    attendance: Yup.number().min(0).max(100).required('Attendance is required'),
    studyHours: Yup.number().min(0).required('Study hours required'),
    previousMarks: Yup.number().min(0).max(100).required('Previous marks required'),
    assignmentScore: Yup.number().min(0).max(10).required('Assignment score required'),
    subjects: Yup.array().of(
      Yup.object({
        code: Yup.string().required('Code is required'),
        name: Yup.string().required('Subject name is required'),
        credits: Yup.number().min(1).max(10).required('Credits required'),
        marks: Yup.number().min(0).max(100).required('Marks required'),
        attendance: Yup.number().min(0).max(100).required('Attendance required'),
        semester: Yup.number().min(1).max(8).required('Semester required'),
      })
    ),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const response = await API.patch(`/students/update/${id}`, values);
        if (response?.data?.statusCode === 200) {
          notifySuccess(response?.data?.message || 'Student updated successfully');
          navigate(`/students/${id}`);
        } else {
          notifyError(response?.data?.message);
        }
      } catch (err) {
        notifyError(err?.response?.data?.message || 'Update failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, setFieldValue } = formik;

  useEffect(() => {
    if (loading) return;

    const currentDepartment = values.department;
    const currentSemester = Number(values.semester) || 1;
    const departmentChanged = previousAcademicSelection.current.department !== currentDepartment;
    const semesterChanged = previousAcademicSelection.current.semester !== currentSemester;

    if (departmentChanged || semesterChanged) {
      setFieldValue('subjects', createDefaultSubjects(currentSemester, currentDepartment), false);
      previousAcademicSelection.current = {
        department: currentDepartment,
        semester: currentSemester,
      };
    }
  }, [loading, setFieldValue, values.department, values.semester]);

  if (loading) return <p>Loading...</p>;

  return (
    <Container maxWidth="lg" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <Typography variant="h4" gutterBottom>Edit Academic Profile</Typography>
      <form onSubmit={formik.handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth margin="normal" name="studentId" label="Student ID" value={formik.values.studentId} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField fullWidth margin="normal" name="name" label="Student Name" value={formik.values.name} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth margin="normal" name="department" label="Department" value={formik.values.department} onChange={formik.handleChange}>
                {DEPARTMENTS.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="semester" label="Semester" type="number" value={formik.values.semester} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth margin="normal" name="gender" label="Gender" value={formik.values.gender} onChange={formik.handleChange}>
                {GENDERS.map((gender) => <MenuItem key={gender} value={gender}>{gender}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="age" label="Age" type="number" value={formik.values.age} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth margin="normal" name="course" label="Course" value={formik.values.course} onChange={formik.handleChange}>
                {COURSES.map((course) => <MenuItem key={course} value={course}>{course}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth margin="normal" name="gpa" label="Current GPA" type="number" value={formik.values.gpa} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth margin="normal" name="creditsEarned" label="Credits Earned" type="number" value={formik.values.creditsEarned} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="attendance" label="Overall Attendance (%)" type="number" value={formik.values.attendance} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="studyHours" label="Study Hours / Day" type="number" value={formik.values.studyHours} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="previousMarks" label="Previous Marks (%)" type="number" value={formik.values.previousMarks} onChange={formik.handleChange} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth margin="normal" name="assignmentScore" label="Assignment Score / 10" type="number" value={formik.values.assignmentScore} onChange={formik.handleChange} />
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom>Subject Performance for {formik.values.department} - Semester {formik.values.semester}</Typography>
        <Stack spacing={2}>
          {formik.values.subjects.map((subject, index) => (
            <Paper key={`${subject.code}-${index}`} sx={{ p: 2.5, borderRadius: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Code" name={`subjects.${index}.code`} value={subject.code} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Subject Name" name={`subjects.${index}.name`} value={subject.name} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Credits" type="number" name={`subjects.${index}.credits`} value={subject.credits} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Marks" type="number" name={`subjects.${index}.marks`} value={subject.marks} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField fullWidth label="Attendance %" type="number" name={`subjects.${index}.attendance`} value={subject.attendance} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>

        <Button color="primary" variant="contained" fullWidth type="submit" style={{ marginTop: '20px' }} disabled={submitting}>
          {submitting ? `Updating Student...` : `Update Student`}
        </Button>
      </form>
    </Container>
  );
};

export default EditStudentForm;
