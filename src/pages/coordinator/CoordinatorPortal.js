import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { AppBar, Drawer } from '../../components/styles';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import CoordinatorSideBar from './CoordinatorSideBar';
import CoordinatorDashboard from './CoordinatorDashboard';
import CoordinatorProfile from './CoordinatorProfile';
import CoordinatorStudents from './CoordinatorStudents';
import AttendanceAnalysis from './AttendanceAnalysis';
import AttendanceReports from './AttendanceReports';

const CoordinatorPortal = () => {
    const [open, setOpen] = React.useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Class Coordinator Portal
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <CoordinatorSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/Coordinator" element={<CoordinatorDashboard />} />
                        <Route path="/Coordinator/dashboard" element={<CoordinatorDashboard />} />
                        <Route path="/Coordinator/students" element={<CoordinatorStudents />} />
                        <Route path="/Coordinator/attendance" element={<AttendanceAnalysis />} />
                        <Route path="/Coordinator/reports" element={<AttendanceReports />} />
                        <Route path="/Coordinator/profile" element={<CoordinatorProfile />} />
                        <Route path="/Coordinator/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
};

export default CoordinatorPortal;

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
};
