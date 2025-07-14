import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { getAllDtodStudents } from '../../../redux/dtodRelated/dtodHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper,
    Box,
    IconButton,
    Button,
    Grid,
    CircularProgress,
    Typography,
    Alert,
    ButtonGroup
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';
import AddIcon from '@mui/icons-material/Add';

const ShowStudents = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { dtodStudentsList } = useSelector((state) => state.dtod);
    const { currentUser } = useSelector(state => state.user);

    const [selectedClassId, setSelectedClassId] = React.useState("");
    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");

    useEffect(() => {
        if (currentUser?._id) {
            console.log('Fetching students for admin:', currentUser._id);
            dispatch(getAllStudents(currentUser._id));
            if (selectedClassId) {
                dispatch(getAllDtodStudents(currentUser._id, selectedClassId));
            }
        }
    }, [currentUser?._id, selectedClassId, dispatch]);

    const deleteHandler = (deleteID, type) => {
        setMessage("");
        setShowPopup(false);
        console.log('Deleting student:', deleteID, 'of type:', type);

        let endpoint = type === 'D2D' ? '/dtod_students/' : '/Student/';
        fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}${deleteID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json',
            },
        })
        .then(res => res.json())
        .then(data => {
            if (data.success || data.message === 'Student deleted successfully') {
                setMessage('Student deleted successfully.');
                // Refresh the student lists
                dispatch(getAllStudents(currentUser._id));
                dispatch(getAllDtodStudents(currentUser._id, selectedClassId));
            } else {
                setMessage(data.message || 'Failed to delete student.');
            }
            setShowPopup(true);
        })
        .catch((error) => {
            console.error('Delete error:', error);
            setMessage('Failed to delete student.');
            setShowPopup(true);
        });
    }

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Bulk Upload Students',
            action: () => navigate("/Admin/students/bulkupload")
        },
        {
            icon: <AddIcon color="primary" />,
            name: 'Add D2D Students',
            action: () => navigate('/Admin/students/dtodbulkupload')
        }
    ];

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate("/Admin/students/student/attendance/" + row.id)
        }
        const handleMarks = () => {
            navigate("/Admin/students/student/marks/" + row.id)
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }

            setOpen(false);
        };
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, row.type)}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton variant="contained"
                    onClick={() => navigate(`/Admin/students/student/${row.id}?type=${row.type}`)}>
                    View
                </BlueButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        sx={{
                            zIndex: 1,
                        }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    disabled={index === 2}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    if (loading) {
        return (
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading students...</Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (currentUser?._id) {
                            dispatch(getAllStudents(currentUser._id));
                            if (selectedClassId) {
                                dispatch(getAllDtodStudents(currentUser._id, selectedClassId));
                            }
                        }
                    }}
                >
                    Retry Loading
                </Button>
                <SpeedDialTemplate actions={actions} />
            </Box>
        );
    }

    if (!studentsList || (Array.isArray(studentsList) && studentsList.length === 0)) {
        return (
            <Box sx={{ p: 2 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        No Students Found
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 3 }}>
                        Get started by adding students using one of these options:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/addstudents")}
                        >
                            Add Individual Student
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<PersonAddAlt1Icon />}
                            onClick={() => navigate("/Admin/students/bulkupload")}
                        >
                            Bulk Upload Students
                        </Button>
                        <Button
                            variant="contained"
                            color="info"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/Admin/students/dtodbulkupload')}
                        >
                            Add D2D Students
                        </Button>
                    </Box>
                </Paper>
                <SpeedDialTemplate actions={actions} />
            </Box>
        );
    }

    // If there are students, show the table
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Students Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAddAlt1Icon />}
                        onClick={() => navigate("/Admin/addstudents")}
                    >
                        Add Student
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/Admin/students/dtodbulkupload')}
                    >
                        Add D2D Students
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableTemplate
                    buttonHaver={StudentButtonHaver}
                    columns={studentColumns.concat([{ id: 'type', label: 'Type', minWidth: 80 }])}
                    rows={studentsList.map(student => ({
                        name: student.name,
                        rollNum: student.rollNum,
                        sclassName: typeof student.sclassName === 'object' ? student.sclassName.sclassName : student.sclassName,
                        id: student._id,
                        type: student.type || 'Regular'
                    }))}
                />
            </Paper>
            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowStudents;