import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteSubject, deleteAllSubjects } from '../../../redux/subjectRelated/subjectHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, CircularProgress, Button, Stack
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';

const ShowSubjects = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    const subjectState = useSelector(state => state.subject);

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const deleteHandler = async (deleteID, address) => {
        try {
            setDeleteInProgress(true);
            console.log('Deleting:', deleteID, address);
            
            let result;
            if (address === "Subject") {
                result = await dispatch(deleteSubject(deleteID));
                console.log('Delete result:', result);
            } else if (address === "Subjects") {
                result = await dispatch(deleteAllSubjects(deleteID));
                console.log('Delete all result:', result);
            }
            
            if (result && result.success) {
                setMessage("Subject deleted successfully!");
                setIsSuccess(true);
                // Refresh the subject list
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
            } else {
                setMessage((result && result.message) || "Failed to delete subject. Please try again.");
                setIsSuccess(false);
            }
            
            setShowPopup(true);
        } catch (error) {
            setMessage("An error occurred while deleting. Please try again.");
            setIsSuccess(false);
            setShowPopup(true);
            console.error("Delete error:", error);
        } finally {
            setDeleteInProgress(false);
        }
    }

    const subjectColumns = [
        { id: 'subName', label: 'Sub Name', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 170 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ]

    const subjectRows = subjectsList.map((subject) => {
        return {
            subName: subject.subName,
            sessions: subject.sessions,
            sclassName: subject.sclassName.sclassName,
            sclassID: subject.sclassName._id,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton 
                    onClick={() => deleteHandler(row.id, "Subject")}
                    disabled={deleteInProgress}
                    size="small"
                >
                    {deleteInProgress ? 
                        <CircularProgress size={20} /> : 
                        <DeleteIcon color="error" />
                    }
                </IconButton>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate(`/Admin/subjects/assign-teachers/${row.id}`)}
                    sx={{ minWidth: 'auto', px: 1 }}
                >
                    Teachers
                </Button>
                <BlueButton 
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </BlueButton>
            </Stack>
        );
    };

    const actions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained"
                                onClick={() => navigate("/Admin/subjects/chooseclass")}>
                                Add Subjects
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 &&
                                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                            }
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    }
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} success={isSuccess} />
        </>
    );
};

export default ShowSubjects;