import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { 
    Paper, 
    Box, 
    Typography, 
    ButtonGroup, 
    Button, 
    Popper, 
    Grow,
    ClickAwayListener, 
    MenuList, 
    MenuItem 
} from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import QuickAttendance from './QuickAttendance';
import { FormControl, InputLabel, Select, MenuItem as MuiMenuItem } from "@mui/material";
import axios from "axios";

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const [subjectDetails, setSubjectDetails] = useState(null);
    const [classID, setClassID] = useState(null);
    const [subjectID, setSubjectID] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [batchList, setBatchList] = useState([]);
    const [showQuickAttendance, setShowQuickAttendance] = useState(false);

    // Set initial IDs from currentUser
    useEffect(() => {
        if (currentUser?.teachSclass?._id) {
            setClassID(currentUser.teachSclass._id);
        }
        if (currentUser?.teachSubject?._id) {
            setSubjectID(currentUser.teachSubject._id);
        }
    }, [currentUser]);

    // Fetch subject details when subjectID changes
    useEffect(() => {
        if (subjectID) {
            fetch(`${process.env.REACT_APP_API_BASE_URL}/subject/${subjectID}`)
                .then(res => res.json())
                .then(data => {
                    setSubjectDetails(data);
                    if (data.isLab && Array.isArray(data.batches)) {
                        setBatchList(data.batches);
                    } else {
                        setBatchList([]);
                    }
                })
                .catch(err => {
                    console.error('Error fetching subject details:', err);
                    setSubjectDetails(null);
                    setBatchList([]);
                });
        }
    }, [subjectID]);

    // Fetch students when classID changes
    useEffect(() => {
        if (classID) {
            const adminId = currentUser?.school?._id;
            if (adminId) {
                dispatch(getClassStudents(classID, adminId));
            } else {
                dispatch(getClassStudents(classID));
            }
        }
    }, [dispatch, classID, currentUser]);

    // Filter students based on selected batch
    const filteredStudents = React.useMemo(() => {
        if (subjectDetails?.isLab && selectedBatch) {
            const batch = batchList.find(b => b.batchName === selectedBatch);
            return batch ? sclassStudents.filter(student => 
                batch.students.includes(student._id)
            ) : [];
        }
        return sclassStudents;
    }, [sclassStudents, subjectDetails, selectedBatch, batchList]);

    const handleBulkAttendance = () => {
        if (!classID || !subjectID) {
            alert('Missing required class or subject information');
            return;
        }
        if (subjectDetails?.isLab && !selectedBatch) {
            alert('Please select a batch to take bulk attendance for this lab subject.');
            return;
        }
        const batchParam = subjectDetails?.isLab && selectedBatch ? 
            `?batch=${encodeURIComponent(selectedBatch)}` : '';
        navigate(`/Teacher/class/student/bulk-attendance/${classID}/${subjectID}${batchParam}`);
    };

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ];

    const StudentsButtonHaver = ({ row }) => {
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
            navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`)
        }
        const handleMarks = () => {
            navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)
        };                const handleBulkAttendance = () => {
            if (!classID || !subjectID) {
                alert('Missing required class or subject information');
                return;
            }
            if (subjectDetails.isLab && batchList.length > 0 && !selectedBatch) {
                alert('Please select a batch to take bulk attendance for this lab subject.');
                return;
            }
            const batchParam = subjectDetails.isLab && selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : '';
            navigate(`/Teacher/class/student/bulk-attendance/${classID}/${subjectID}${batchParam}`);
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
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Teacher/class/student/" + row.id)
                    }
                >
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

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>
                    
                    {/* Batch selector for lab subjects */}
                    {subjectDetails?.isLab && batchList.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Batch</InputLabel>
                            <Select
                                value={selectedBatch}
                                label="Select Batch"
                                onChange={(e) => setSelectedBatch(e.target.value)}
                            >
                                {batchList.map((batch, idx) => (
                                    <MuiMenuItem key={idx} value={batch.batchName}>
                                        {batch.batchName}
                                    </MuiMenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {getresponse ? (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                No Students Found
                            </Box>
                        </>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5">
                                    Students List:
                                </Typography>
                                <BlueButton
                                    variant="contained"
                                    onClick={handleBulkAttendance}
                                    disabled={subjectDetails?.isLab && !selectedBatch}
                                >
                                    Take Bulk Attendance
                                </BlueButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <BlueButton
                                    onClick={() => setShowQuickAttendance(!showQuickAttendance)}
                                    disabled={subjectDetails?.isLab && !selectedBatch}
                                >
                                    {showQuickAttendance ? 'Hide Quick Attendance' : 'Quick Attendance'}
                                </BlueButton>
                            </Box>
                            {showQuickAttendance && (
                                <Box sx={{ mb: 2 }}>
                                    <QuickAttendance 
                                        classID={classID} 
                                        subjectID={subjectID} 
                                        batchName={selectedBatch}
                                        disabled={subjectDetails?.isLab && !selectedBatch} 
                                    />
                                </Box>
                            )}
                            {filteredStudents.length > 0 && (
                                <TableTemplate 
                                    buttonHaver={StudentsButtonHaver} 
                                    columns={studentColumns} 
                                    rows={filteredStudents.map(student => ({
                                        name: student.name,
                                        rollNum: student.rollNum,
                                        id: student._id
                                    }))} 
                                />
                            )}
                        </Paper>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;