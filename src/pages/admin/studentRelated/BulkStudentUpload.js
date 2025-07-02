import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Typography, TextField,
    FormControl, InputLabel, Select,
    MenuItem, Button, CircularProgress
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import Papa from 'papaparse';
import Popup from '../../../components/Popup';

const BulkStudentUpload = ({ dtodMode = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);

    const [file, setFile] = useState(null);
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            if (uploadedFile.type === 'text/csv' || 
                uploadedFile.type === 'application/vnd.ms-excel' ||
                uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                setFile(uploadedFile);
            } else {
                setMessage('Please upload a CSV or Excel file');
                setShowPopup(true);
            }
        }
    };

    const handleClassChange = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    };

    const processStudentData = async (results) => {
        if (dtodMode) {
            // D2D upload: send file directly to backend
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sclassName', sclassName); // Send selected class ObjectId
            formData.append('school', currentUser._id); // Send school (admin _id)
            setLoading(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/DtodStudentsUpload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    },
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    setMessage('D2D students uploaded successfully!');
                } else {
                    setMessage(data.message || 'Failed to upload D2D students');
                }
            } catch (error) {
                setMessage('Error uploading D2D students: ' + error.message);
            }
            setShowPopup(true);
            setLoading(false);
            return;
        }

        const students = results.data;
        let successCount = 0;
        let errorCount = 0;

        for (const student of students) {
            if (!student.name || !student.rollNum || !student.email) continue;

            const password = `${student.name.toLowerCase()}${student.rollNum}`;
            const fields = {
                name: student.name,
                rollNum: student.rollNum,
                email: student.email,
                password,
                sclassName,
                adminID: currentUser._id,
                role: 'Student',
                attendance: []
            };

            try {
                await dispatch(registerUser(fields, 'Student'));
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }

        setMessage(`Successfully added ${successCount} students. ${errorCount} failed.`);
        setShowPopup(true);
        setLoading(false);

        if (successCount > 0) {
            setTimeout(() => navigate(-1), 2000);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!file) {
            setMessage('Please select a file to upload');
            setShowPopup(true);
            return;
        }

        if (!sclassName) {
            setMessage('Please select a class');
            setShowPopup(true);
            return;
        }

        setLoading(true);

        Papa.parse(file, {
            complete: processStudentData,
            header: true,
            skipEmptyLines: true,
        });
    };

    return (
        <Box
            sx={{
                flex: '1 1 auto',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Box
                sx={{
                    maxWidth: 750,
                    px: 3,
                    py: '50px',
                    width: '100%'
                }}
            >
                <div>
                    <Typography variant="h4">{dtodMode ? 'Bulk D2D Student Upload' : 'Bulk Student Upload'}</Typography>
                    <Typography sx={{ mb: 3 }} variant="body2">
                        Upload CSV/Excel file containing {dtodMode ? 'D2D student' : 'student'} information
                    </Typography>
                    
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>File Format Requirements:</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        The CSV/Excel file must contain the following columns:
                    </Typography>
                    <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                        <li><Typography variant="body2">Name (text only)</Typography></li>
                        <li><Typography variant="body2">Roll Number (alphanumeric)</Typography></li>
                        <li><Typography variant="body2">Email (valid email format)</Typography></li>
                    </ul>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Note:</strong> Student passwords will be automatically generated in the format: <em>firstname_rollnumber</em>
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                        Example: For a student named "John" with roll number "A123", the password will be "john_A123"
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                value={className}
                                label="Select Class"
                                onChange={handleClassChange}
                                required
                            >
                                <MenuItem value="Select Class">Select Class</MenuItem>
                                {sclassesList.map((classItem) => (
                                    <MenuItem
                                        key={classItem._id}
                                        value={classItem.sclassName}
                                    >
                                        {classItem.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            type="file"
                            fullWidth
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <CloudUpload />
                            }}
                        />

                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : dtodMode ? 'Upload D2D Students' : 'Upload'}
                        </Button>
                    </form>
                </div>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default BulkStudentUpload;