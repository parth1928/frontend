import React, { useState, useEffect } from 'react';
import {
    Box,
    CssBaseline,
    IconButton,
    Toolbar,
    List,
    Typography,
    Divider,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from "redux/userRelated/userHandle";
import { getClassDetails } from 'redux/sclassRelated/sclassHandle';
import { getSubjectList } from 'redux/subjectRelated/subjectHandle';
import { getStudentAttendance } from 'redux/studentRelated/studentHandle';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return '#4caf50';  // Green
    if (percentage >= 60) return '#ff9800';  // Orange
    return '#f44336';  // Red
};

const CoordinatorDashboard = () => {
    const [open, setOpen] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { currentClass, loading: classLoading } = useSelector((state) => state.sclass);
    const { subjectsList } = useSelector((state) => state.subject);
    const { studentsAttendance, loading: attendanceLoading } = useSelector((state) => state.student);

    useEffect(() => {
        if (currentUser?.assignedClass) {
            dispatch(getClassDetails(currentUser.assignedClass));
            dispatch(getSubjectList({ classId: currentUser.assignedClass }));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (currentClass?._id) {
            dispatch(getStudentAttendance(currentClass._id));
        }
    }, [dispatch, currentClass]);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const downloadAttendanceReport = async () => {
        try {
            const response = await fetch(`/Coordinator/attendance/download/${currentUser._id}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentClass.sclassName}_attendance.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading attendance:', error);
        }
    };

    if (classLoading || attendanceLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="absolute" open={open}>
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
                        Class Coordinator Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List component="nav">
                    <ListItem>
                        <ListItemButton onClick={() => navigate("/Coordinator/dashboard")}>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={() => navigate("/Coordinator/profile")}>
                            <ListItemIcon>
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={() => dispatch(logoutUser())}>
                            <ListItemIcon>
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    pt: 8
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Class {currentClass?.sclassName} Dashboard
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadAttendanceReport}
                        >
                            Download Attendance Report
                        </Button>
                    </Box>

                    <Paper sx={{ p: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student Name</TableCell>
                                        {subjectsList.map((subject) => (
                                            <TableCell key={subject._id} align="center">
                                                {subject.subjectName}
                                            </TableCell>
                                        ))}
                                        <TableCell align="center">Overall</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentsAttendance.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell>{student.name}</TableCell>
                                            {subjectsList.map((subject) => {
                                                const attendance = student.attendance[subject._id] || 0;
                                                return (
                                                    <TableCell
                                                        key={subject._id}
                                                        align="center"
                                                        sx={{
                                                            color: getAttendanceColor(attendance)
                                                        }}
                                                    >
                                                        {attendance}%
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    color: getAttendanceColor(student.overallAttendance)
                                                }}
                                            >
                                                {student.overallAttendance}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default CoordinatorDashboard;
