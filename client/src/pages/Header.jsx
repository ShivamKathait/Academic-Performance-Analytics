import React, { useState } from 'react';
import {
    Container, Box, Typography, Button, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Stack, Chip
} from '@mui/material';
import { notifySuccess, notifyError } from '../services/toastNotifications';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
    const name = localStorage.getItem('name');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            localStorage.clear();
            notifySuccess('Logged Out Successfully');
        } catch {
            notifyError('Something went wrong !!');
        } finally {
            window.location.reload();
        }
    };

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                py: 2,
                borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
                background: 'rgba(248, 250, 252, 0.84)',
                backdropFilter: 'blur(14px)',
            }}
        >
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <Typography variant="overline" color="text.secondary">Academic Analytics Dashboard</Typography>
                            <Chip label={location.pathname === '/' ? 'Live Dashboard' : 'Editing View'} size="small" color="primary" variant="outlined" />
                        </Stack>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            Faculty Console: {name}
                        </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button variant={location.pathname === '/' ? 'contained' : 'outlined'} onClick={() => navigate('/')}>Dashboard</Button>
                        <Button variant={location.pathname === '/students/add' ? 'contained' : 'outlined'} onClick={() => navigate('/students/add')}>Add Student</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpen(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Log out
                        </Button>
                    </Stack>
                </Box>
            </Container>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Header;
