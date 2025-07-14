import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { getAllDtodStudents } from '../../../redux/dtodRelated/dtodHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper, Box, IconButton, Button
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

import * as React from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popup from '../../../components/Popup';
import AddIcon from '@mui/icons-material/Add';
import { CircularProgress, Typography, Alert } from '@mui/material';

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
            console.log('Fetching all students for admin:', currentUser._id);
            dispatch(getAllStudents(currentUser._id));
            dispatch(getAllDtodStudents(currentUser._id, selectedClassId));
        }
    }, [currentUser?._id, selectedClassId, dispatch]);

    // Debug logging
    useEffect(() => {
        console.log('Component State:', {
            studentsList,
            dtodStudentsList,
            loading,
            error,
            response
        });
    }, [studentsList, dtodStudentsList, loading, error, response]);

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

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    // Merge and process student lists
    const allStudents = React.useMemo(() => {
        console.log('Processing student lists:', {
            regular: studentsList,
            dtod: dtodStudentsList
        });

        return [
            ...(Array.isArray(studentsList) ? studentsList : []),
            ...(Array.isArray(dtodStudentsList) ? dtodStudentsList.map(s => ({ ...s, type: 'D2D' })) : [])
        ];
    }, [studentsList, dtodStudentsList]);

    const studentRows = React.useMemo(() => {
        return allStudents.map((student) => {
            let className = '';
            if (student.sclassName && typeof student.sclassName === 'object' && student.sclassName.sclassName) {
                className = student.sclassName.sclassName;
            } else if (typeof student.sclassName === 'string') {
                className = student.sclassName;
            }
            return {
                name: student.name,
                rollNum: student.rollNum,
                sclassName: className,
                id: student._id,
                type: student.type || 'Regular',
            };
        });
    }, [allStudents]);

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

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Bulk Upload Students',
            action: () => navigate("/Admin/students/bulkupload")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading students...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading students: {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => {
                        dispatch(getAllStudents(currentUser._id));
                        dispatch(getAllDtodStudents(currentUser._id, selectedClassId));
                    }}
                >
                    Retry Loading
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    Students Management
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/Admin/students/dtodbulkupload')}
                >
                    Add D2D Students
                </Button>
            </Box>

            {response ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                        Add Students
                    </GreenButton>
                </Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {studentRows.length > 0 ? (
                        <TableTemplate
                            buttonHaver={StudentButtonHaver}
                            columns={studentColumns.concat([{ id: 'type', label: 'Type', minWidth: 80 }])}
                            rows={studentRows}
                        />
                    ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary">
                                No students found
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={() => navigate("/Admin/addstudents")}
                            >
                                Add Your First Student
                            </Button>
                        </Box>
                    )}
                    <SpeedDialTemplate actions={actions} />
                </Paper>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowStudents;