import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import API from './../services/api';
import { useNavigate } from 'react-router-dom';
import { notifyError, notifySuccess } from './../services/toastNotifications';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Fade,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { DEPARTMENTS, GENDERS } from '../constants';

const chartPalette = ['#0f766e', '#f97316', '#2563eb', '#7c3aed', '#dc2626', '#0891b2'];
const riskColors = { Low: '#15803d', Moderate: '#ea580c', High: '#b91c1c' };

function MetricCard({ title, value, subtitle, tone = 'primary', progress = 0 }) {
    return (
        <Card
            sx={{
                borderRadius: 5,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 44px rgba(15, 23, 42, 0.12)',
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.6)), linear-gradient(135deg, ${tone === 'error' ? '#fecaca' : tone === 'warning' ? '#fde68a' : tone === 'success' ? '#bbf7d0' : tone === 'info' ? '#bfdbfe' : '#99f6e4'}, transparent)`,
                    opacity: 0.95,
                }}
            />
            <CardContent sx={{ position: 'relative' }}>
                <Typography variant="overline" color="text.secondary">{title}</Typography>
                <Typography variant="h4" color={`${tone}.main`} sx={{ mb: 1 }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>{subtitle}</Typography>
                <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(progress, 100))}
                    sx={{
                        mt: 2,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    }}
                />
            </CardContent>
        </Card>
    );
}

function BarChartCard({ title, items, valueKey, labelKey, suffix = '', color = chartPalette[0], onSelect, activeLabel, helperText }) {
    const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);

    return (
        <Card sx={{ borderRadius: 5, height: '100%' }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                        <Typography variant="h6">{title}</Typography>
                        {helperText ? <Typography variant="body2" color="text.secondary">{helperText}</Typography> : null}
                    </Box>
                    {activeLabel ? <Chip label={`Focused: ${activeLabel}`} size="small" color="primary" variant="outlined" /> : null}
                </Stack>
                <Stack spacing={2} mt={2}>
                    {items.length ? items.map((item) => {
                        const label = item[labelKey];
                        const value = Number(item[valueKey] || 0);
                        const width = `${Math.max((value / maxValue) * 100, 6)}%`;
                        const isActive = activeLabel === label;
                        return (
                            <Box
                                key={`${label}-${value}`}
                                onClick={() => onSelect?.(label)}
                                sx={{
                                    cursor: onSelect ? 'pointer' : 'default',
                                    borderRadius: 3,
                                    p: 1,
                                    transition: 'background-color 160ms ease, transform 160ms ease',
                                    bgcolor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                    '&:hover': onSelect ? {
                                        bgcolor: 'rgba(15, 118, 110, 0.08)',
                                        transform: 'translateX(4px)',
                                    } : undefined,
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" mb={0.75}>
                                    <Typography variant="body2" fontWeight={isActive ? 700 : 500}>{label}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{value}{suffix}</Typography>
                                </Box>
                                <Box sx={{ height: 10, borderRadius: 999, bgcolor: 'rgba(15, 118, 110, 0.12)', overflow: 'hidden' }}>
                                    <Box sx={{ width, height: '100%', bgcolor: color, borderRadius: 999, transition: 'width 260ms ease' }} />
                                </Box>
                            </Box>
                        );
                    }) : <Typography color="text.secondary">No data available for this filter.</Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
}

function TrendChartCard({ title, items, activeSemester, onSelectSemester }) {
    const width = 420;
    const height = 210;
    const padding = 28;
    const maxValue = Math.max(...items.map((item) => item.avgGpa || 0), 1);
    const denominator = Math.max(items.length - 1, 1);
    const points = items.map((item, index) => {
        const x = padding + ((width - padding * 2) * index) / denominator;
        const y = height - padding - ((height - padding * 2) * (item.avgGpa || 0)) / maxValue;
        return { ...item, x, y };
    });

    return (
        <Card sx={{ borderRadius: 5, height: '100%' }}>
            <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">Click a semester point to narrow the cohort.</Typography>
                {items.length ? (
                    <>
                        <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', mt: 2 }}>
                            <defs>
                                <linearGradient id="semesterTrendStroke" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#0f766e" />
                                </linearGradient>
                            </defs>
                            <polyline
                                fill="none"
                                stroke="url(#semesterTrendStroke)"
                                strokeWidth="5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                            />
                            {points.map((point) => {
                                const active = Number(activeSemester) === Number(point.semester);
                                return (
                                    <g key={point.semester} onClick={() => onSelectSemester?.(String(point.semester))} style={{ cursor: 'pointer' }}>
                                        <circle cx={point.x} cy={point.y} r={active ? '10' : '7'} fill={active ? '#0f766e' : '#2563eb'} opacity={active ? 1 : 0.9} />
                                        <title>{`Semester ${point.semester}: GPA ${point.avgGpa}, Attendance ${point.avgAttendance}%`}</title>
                                    </g>
                                );
                            })}
                        </Box>
                        <Stack direction="row" justifyContent="space-between" mt={1}>
                            {items.map((item) => (
                                <Chip
                                    key={item.semester}
                                    label={`Sem ${item.semester}`}
                                    size="small"
                                    color={Number(activeSemester) === Number(item.semester) ? 'primary' : 'default'}
                                    variant={Number(activeSemester) === Number(item.semester) ? 'filled' : 'outlined'}
                                    onClick={() => onSelectSemester?.(String(item.semester))}
                                />
                            ))}
                        </Stack>
                    </>
                ) : <Typography color="text.secondary">No trend data available.</Typography>}
            </CardContent>
        </Card>
    );
}

function DistributionCard({ title, distribution, onSelectRisk, activeRisk }) {
    const total = Object.values(distribution || {}).reduce((sum, value) => sum + value, 0) || 1;

    return (
        <Card sx={{ borderRadius: 5, height: '100%' }}>
            <CardContent>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">Tap a risk band to focus the dashboard.</Typography>
                <Stack spacing={2} mt={2}>
                    {Object.entries(distribution || {}).map(([label, value]) => (
                        <Box
                            key={label}
                            onClick={() => onSelectRisk?.(label)}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 3,
                                p: 1,
                                border: activeRisk === label ? `1px solid ${riskColors[label]}` : '1px solid transparent',
                                '&:hover': { bgcolor: `${riskColors[label]}10` },
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" mb={0.75}>
                                <Typography variant="body2" fontWeight={700}>{label}</Typography>
                                <Typography variant="body2" fontWeight={700}>{value}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(value / total) * 100}
                                sx={{
                                    height: 10,
                                    borderRadius: 999,
                                    backgroundColor: `${riskColors[label]}22`,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: riskColors[label],
                                    }
                                }}
                            />
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ScatterPlotCard({ points }) {
    const width = 420;
    const height = 250;
    const padding = 30;

    return (
        <Card sx={{ borderRadius: 5, height: '100%' }}>
            <CardContent>
                <Typography variant="h6">Attendance vs Marks</Typography>
                <Typography variant="body2" color="text.secondary">Each point is a student. High-risk students appear in red.</Typography>
                {points.length ? (
                    <Box component="svg" viewBox={`0 0 ${width} ${height}`} sx={{ width: '100%', mt: 2 }}>
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" />
                        {points.slice(0, 20).map((point) => {
                            const x = padding + ((width - padding * 2) * point.attendance) / 100;
                            const y = height - padding - ((height - padding * 2) * point.marks) / 100;
                            const fill = riskColors[point.riskLevel] || '#2563eb';
                            return (
                                <circle key={point.id} cx={x} cy={y} r="7" fill={fill} opacity="0.88">
                                    <title>{`${point.name}: ${point.attendance}% attendance, ${point.marks} marks, ${point.riskLevel} risk`}</title>
                                </circle>
                            );
                        })}
                    </Box>
                ) : <Typography color="text.secondary">No correlation data available.</Typography>}
                <Stack direction="row" spacing={2} mt={1}>
                    {Object.entries(riskColors).map(([label, color]) => (
                        <Stack key={label} direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                            <Typography variant="caption">{label}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

function StudentSpotlight({ student, onOpen, onPredict, loading }) {
    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 4,
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)',
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: riskColors[student.riskLevel] || '#0f766e' }}>{student.name?.[0] || 'S'}</Avatar>
                    <Box>
                        <Typography fontWeight={700}>{student.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{student.department} • Semester {student.semester}</Typography>
                    </Box>
                </Stack>
                <Chip label={`${student.riskScore} score`} size="small" color={student.riskLevel === 'High' ? 'error' : student.riskLevel === 'Moderate' ? 'warning' : 'success'} />
            </Stack>
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                <Chip label={`GPA ${student.gpa}`} size="small" variant="outlined" />
                <Chip label={`${student.attendance}% attendance`} size="small" variant="outlined" />
                <Chip label={student.riskLevel} size="small" color={student.riskLevel === 'High' ? 'error' : student.riskLevel === 'Moderate' ? 'warning' : 'success'} variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={1} mt={2}>
                <Button size="small" variant="contained" onClick={onOpen}>Open</Button>
                <Button size="small" variant="outlined" onClick={onPredict} disabled={loading}>{loading ? 'Running...' : 'Refresh Risk'}</Button>
            </Stack>
        </Paper>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPredictionIds, setLoadingPredictionIds] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        department: '',
        semester: '',
        gender: '',
        subject: '',
        riskLevel: '',
    });
    const [activeView, setActiveView] = useState('overview');
    const filtersRef = useRef(filters);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const loadDashboard = useCallback(async (appliedFilters = filtersRef.current) => {
        setLoading(true);
        try {
            const [analyticsResponse, studentsResponse] = await Promise.all([
                API.get('/analytics/dashboard', { params: appliedFilters }),
                API.get('/students', { params: { ...appliedFilters, limit: 50 } }),
            ]);

            setAnalytics(analyticsResponse?.data?.data || null);
            setStudents(studentsResponse?.data?.data || []);
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Unable to load analytics dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialFilters = { name: '', department: '', semester: '', gender: '', subject: '', riskLevel: '' };
        loadDashboard(initialFilters);
    }, [loadDashboard]);

    const handlePredictResult = async (studentId) => {
        setLoadingPredictionIds((prev) => [...prev, studentId]);
        try {
            const response = await API.post(`/predict/${studentId}`);
            const { message, data } = response?.data || {};
            if (response?.data?.statusCode === 200) {
                notifySuccess(`${message} → ${data?.studentName}: ${data?.prediction}`);
                loadDashboard();
            } else {
                notifyError(message || 'An error occurred while predicting the result');
            }
        } catch (error) {
            notifyError(error?.response?.data?.message || 'An error occurred while predicting the result');
        } finally {
            setLoadingPredictionIds((prev) => prev.filter((id) => id !== studentId));
        }
    };

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const handleApplyFilters = () => {
        loadDashboard(filters);
    };

    const clearFilters = () => {
        const reset = { name: '', department: '', semester: '', gender: '', subject: '', riskLevel: '' };
        setFilters(reset);
        loadDashboard(reset);
    };

    const quickInsight = useMemo(() => {
        if (!analytics?.summary) return 'Loading cohort insight...';
        if ((analytics.summary.atRiskCount || 0) > Math.max(2, Math.floor((analytics.summary.totalStudents || 0) * 0.3))) {
            return 'Risk is clustering above normal levels. Prioritize outreach for the watchlist and inspect semester-specific dips.';
        }
        if ((analytics.summary.avgAttendance || 0) < 75) {
            return 'Attendance is the main warning signal right now. Use the scatter plot and semester filters to find where engagement is falling off.';
        }
        return 'The cohort looks relatively stable. Use subject and semester filters to spot localized trouble before it spreads.';
    }, [analytics]);

    const quickDepartments = useMemo(() => (analytics?.departmentPerformance || []).slice(0, 4).map((item) => item.department), [analytics]);

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
    }

    const summary = analytics?.summary || {};
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Fade in timeout={500}>
                <Box>
                    <Paper
                        sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 6,
                            mb: 4,
                            color: 'white',
                            background: 'linear-gradient(135deg, #0f172a 0%, #0f766e 55%, #2563eb 100%)',
                            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} lg={8}>
                                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.74)' }}>Live academic control room</Typography>
                                <Typography variant="h3" sx={{ mt: 1, mb: 1.5 }}>Academic Analytics Dashboard</Typography>
                                <Typography sx={{ maxWidth: 760, color: 'rgba(255,255,255,0.82)' }}>
                                    Monitor department trends, subject outcomes, semester movement, and at-risk students from one place. Every chart supports a tighter drill-down path.
                                </Typography>
                                <Stack direction="row" spacing={1} mt={3} flexWrap="wrap" useFlexGap>
                                    <Chip label={`${summary.totalStudents || 0} students in view`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }} />
                                    <Chip label={`${summary.atRiskCount || 0} at risk`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }} />
                                    <Chip label={`${activeFiltersCount} active filters`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }} />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                                <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.72)' }}>Cohort pulse</Typography>
                                    <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>What deserves attention?</Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>{quickInsight}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 5, mb: 4 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} mb={2}>
                            <Box>
                                <Typography variant="h6">Explore the cohort</Typography>
                                <Typography variant="body2" color="text.secondary">Use filters, quick chips, and chart clicks to move from broad trends into specific student action.</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {quickDepartments.map((department) => (
                                    <Chip
                                        key={department}
                                        label={department}
                                        clickable
                                        color={filters.department === department ? 'primary' : 'default'}
                                        variant={filters.department === department ? 'filled' : 'outlined'}
                                        onClick={() => {
                                            const next = { ...filtersRef.current, department, riskLevel: '' };
                                            setFilters(next);
                                            loadDashboard(next);
                                        }}
                                    />
                                ))}
                                <Chip
                                    label="High Risk"
                                    clickable
                                    color={filters.riskLevel === 'High' ? 'error' : 'default'}
                                    variant={filters.riskLevel === 'High' ? 'filled' : 'outlined'}
                                    onClick={() => {
                                        const next = { ...filtersRef.current, riskLevel: filtersRef.current.riskLevel === 'High' ? '' : 'High' };
                                        setFilters(next);
                                        loadDashboard(next);
                                    }}
                                />
                            </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={2.2}>
                                <TextField fullWidth label="Search Student" value={filters.name} onChange={(event) => updateFilter('name', event.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={2.2}>
                                <TextField select fullWidth label="Department" value={filters.department} onChange={(event) => updateFilter('department', event.target.value)}>
                                    <MenuItem value="">All Departments</MenuItem>
                                    {DEPARTMENTS.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={1.6}>
                                <TextField fullWidth label="Semester" type="number" value={filters.semester} onChange={(event) => updateFilter('semester', event.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={1.8}>
                                <TextField select fullWidth label="Gender" value={filters.gender} onChange={(event) => updateFilter('gender', event.target.value)}>
                                    <MenuItem value="">All Genders</MenuItem>
                                    {GENDERS.map((gender) => <MenuItem key={gender} value={gender}>{gender}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2.2}>
                                <TextField fullWidth label="Subject" value={filters.subject} onChange={(event) => updateFilter('subject', event.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField select fullWidth label="Risk Level" value={filters.riskLevel} onChange={(event) => updateFilter('riskLevel', event.target.value)}>
                                    <MenuItem value="">All Levels</MenuItem>
                                    <MenuItem value="Low">Low</MenuItem>
                                    <MenuItem value="Moderate">Moderate</MenuItem>
                                    <MenuItem value="High">High</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button variant="outlined" onClick={clearFilters}>Reset</Button>
                                    <Button variant="contained" onClick={handleApplyFilters}>Apply Filters</Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ borderRadius: 5, mb: 4, overflow: 'hidden' }}>
                        <Tabs
                            value={activeView}
                            onChange={(_, value) => setActiveView(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ px: 1.5, pt: 1.5 }}
                        >
                            <Tab value="overview" label="Overview" />
                            <Tab value="cohort" label="Cohort Explorer" />
                            <Tab value="watchlist" label="Risk Watchlist" />
                        </Tabs>
                        <Divider />

                        {activeView === 'overview' ? (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3} mb={1}>
                                    <Grid item xs={12} md={2.4}><MetricCard title="Students" value={summary.totalStudents || 0} subtitle="Students visible in the active filter set" tone="primary" progress={(summary.totalStudents || 0) * 4} /></Grid>
                                    <Grid item xs={12} md={2.4}><MetricCard title="Average GPA" value={summary.avgGpa || 0} subtitle="Current GPA snapshot across the filtered cohort" tone="success" progress={(summary.avgGpa || 0) * 10} /></Grid>
                                    <Grid item xs={12} md={2.4}><MetricCard title="Average Attendance" value={`${summary.avgAttendance || 0}%`} subtitle="Cross-department attendance pulse" tone="info" progress={summary.avgAttendance || 0} /></Grid>
                                    <Grid item xs={12} md={2.4}><MetricCard title="Average Marks" value={`${summary.avgMarks || 0}%`} subtitle="Mean marks across enrolled subjects" tone="warning" progress={summary.avgMarks || 0} /></Grid>
                                    <Grid item xs={12} md={2.4}><MetricCard title="At Risk" value={summary.atRiskCount || 0} subtitle={`${summary.passRate || 0}% predicted on track`} tone="error" progress={100 - (summary.passRate || 0)} /></Grid>
                                </Grid>

                                <Grid container spacing={3} mt={1}>
                                    <Grid item xs={12} lg={4}>
                                        <BarChartCard
                                            title="Department Performance"
                                            helperText="Click a department to focus the rest of the dashboard."
                                            items={(analytics?.departmentPerformance || []).slice(0, 6)}
                                            labelKey="department"
                                            valueKey="avgGpa"
                                            color={chartPalette[0]}
                                            activeLabel={filters.department}
                                            onSelect={(department) => {
                                                const nextDepartment = filtersRef.current.department === department ? '' : department;
                                                const next = { ...filtersRef.current, department: nextDepartment };
                                                setFilters(next);
                                                loadDashboard(next);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={4}>
                                        <TrendChartCard
                                            title="Semester GPA Trend"
                                            items={analytics?.semesterTrend || []}
                                            activeSemester={filters.semester}
                                            onSelectSemester={(semester) => {
                                                const nextSemester = String(filtersRef.current.semester) === String(semester) ? '' : semester;
                                                const next = { ...filtersRef.current, semester: nextSemester };
                                                setFilters(next);
                                                loadDashboard(next);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={4}>
                                        <DistributionCard
                                            title="Risk Distribution"
                                            distribution={analytics?.riskDistribution || {}}
                                            activeRisk={filters.riskLevel}
                                            onSelectRisk={(riskLevel) => {
                                                const nextRisk = filtersRef.current.riskLevel === riskLevel ? '' : riskLevel;
                                                const next = { ...filtersRef.current, riskLevel: nextRisk };
                                                setFilters(next);
                                                loadDashboard(next);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={6}>
                                        <BarChartCard
                                            title="Top Subject Outcomes"
                                            helperText="Use subject ranking to identify strong and weak course pockets."
                                            items={(analytics?.subjectAnalytics || []).slice(0, 6)}
                                            labelKey="name"
                                            valueKey="avgMarks"
                                            suffix="%"
                                            color={chartPalette[1]}
                                            activeLabel={filters.subject}
                                            onSelect={(subject) => {
                                                const nextSubject = filtersRef.current.subject === subject ? '' : subject;
                                                const next = { ...filtersRef.current, subject: nextSubject };
                                                setFilters(next);
                                                loadDashboard(next);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={6}>
                                        <ScatterPlotCard points={analytics?.attendanceCorrelation || []} />
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}

                        {activeView === 'cohort' ? (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} lg={8}>
                                        <Card sx={{ borderRadius: 5, height: '100%' }}>
                                            <CardContent>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Box>
                                                        <Typography variant="h6">Student Drill-Down Table</Typography>
                                                        <Typography variant="body2" color="text.secondary">Use this list to jump from cohort-level patterns into individual profiles.</Typography>
                                                    </Box>
                                                    <Chip label={`${students.length} records`} variant="outlined" />
                                                </Stack>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Student</TableCell>
                                                                <TableCell>Department</TableCell>
                                                                <TableCell>Semester</TableCell>
                                                                <TableCell>GPA</TableCell>
                                                                <TableCell>Attendance</TableCell>
                                                                <TableCell>Risk</TableCell>
                                                                <TableCell align="right">Actions</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {students.map((student) => (
                                                                <TableRow key={student._id} hover>
                                                                    <TableCell>
                                                                        <Typography fontWeight={700}>{student.name}</Typography>
                                                                        <Typography variant="caption" color="text.secondary">{student.studentId || 'No ID'}</Typography>
                                                                    </TableCell>
                                                                    <TableCell>{student.department}</TableCell>
                                                                    <TableCell>{student.semester}</TableCell>
                                                                    <TableCell>{student.gpa}</TableCell>
                                                                    <TableCell>{student.attendance}%</TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            size="small"
                                                                            label={student.riskLevel || student.analyticsRisk?.riskLevel || 'Moderate'}
                                                                            color={(student.riskLevel || student.analyticsRisk?.riskLevel) === 'High' ? 'error' : (student.riskLevel || student.analyticsRisk?.riskLevel) === 'Moderate' ? 'warning' : 'success'}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                            <Button size="small" onClick={() => navigate(`/students/${student._id}`)}>View</Button>
                                                                            <Button size="small" variant="outlined" onClick={() => navigate(`/students/edit/${student._id}`)}>Edit</Button>
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                disabled={loadingPredictionIds.includes(student._id)}
                                                                                onClick={() => handlePredictResult(student._id)}
                                                                            >
                                                                                {loadingPredictionIds.includes(student._id) ? 'Running...' : 'Predict'}
                                                                            </Button>
                                                                        </Stack>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} lg={4}>
                                        <Card sx={{ borderRadius: 5, height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="h6">Gender Mix</Typography>
                                                <Typography variant="body2" color="text.secondary">A quick demographic pulse for the current filter set.</Typography>
                                                <Stack spacing={2} mt={3}>
                                                    {Object.entries(analytics?.genderDistribution || {}).map(([gender, count], index) => (
                                                        <Box key={gender}>
                                                            <Box display="flex" justifyContent="space-between" mb={0.75}>
                                                                <Typography variant="body2">{gender}</Typography>
                                                                <Typography variant="body2" fontWeight={700}>{count}</Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={summary.totalStudents ? (count / summary.totalStudents) * 100 : 0}
                                                                sx={{
                                                                    height: 10,
                                                                    borderRadius: 999,
                                                                    backgroundColor: `${chartPalette[index % chartPalette.length]}22`,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: chartPalette[index % chartPalette.length],
                                                                    }
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}

                        {activeView === 'watchlist' ? (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} lg={5}>
                                        <Card sx={{ borderRadius: 5, height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="h6">At-Risk Students</Typography>
                                                <Typography variant="body2" color="text.secondary">This is your intervention queue. Open profiles to review subjects and trigger fresh predictions.</Typography>
                                                <Stack spacing={1.5} mt={3}>
                                                    {(analytics?.topRiskStudents || []).length ? analytics.topRiskStudents.map((student) => (
                                                        <StudentSpotlight
                                                            key={student._id}
                                                            student={student}
                                                            loading={loadingPredictionIds.includes(student._id)}
                                                            onOpen={() => navigate(`/students/${student._id}`)}
                                                            onPredict={() => handlePredictResult(student._id)}
                                                        />
                                                    )) : <Typography color="text.secondary">No students are currently flagged as high risk.</Typography>}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} lg={7}>
                                        <Card sx={{ borderRadius: 5, height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="h6">Intervention Notes</Typography>
                                                <Typography variant="body2" color="text.secondary">Suggested ways to use this watchlist effectively.</Typography>
                                                <Stack spacing={2} mt={3}>
                                                    {[
                                                        'Start with students whose attendance and marks are both low in the scatter plot.',
                                                        'Use semester filtering after opening the watchlist to see whether the risk is cohort-specific.',
                                                        'Refresh risk after updating attendance, GPA, or subject marks to see whether the student moves out of the watchlist.'
                                                    ].map((note, index) => (
                                                        <Paper key={note} sx={{ p: 2.5, borderRadius: 4, bgcolor: index === 0 ? 'rgba(37, 99, 235, 0.06)' : 'white' }}>
                                                            <Stack direction="row" spacing={1.5} alignItems="start">
                                                                <Avatar sx={{ bgcolor: chartPalette[index + 2], width: 30, height: 30 }}>{index + 1}</Avatar>
                                                                <Typography variant="body2">{note}</Typography>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}
                    </Paper>
                </Box>
            </Fade>
        </Container>
    );
}

export default Dashboard;
