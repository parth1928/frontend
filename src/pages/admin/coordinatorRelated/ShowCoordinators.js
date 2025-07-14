import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Button,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { getClassCoordinators } from '../../../redux/userRelated/userHandle';
import { BlueButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import AddCoordinator from './AddCoordinator';

const ShowCoordinators = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [showPopup, setShowPopup] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [message, setMessage] = useState("");

    const [coordinators, setCoordinators] = useState([]);

    const { response, loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getClassCoordinators(currentUser._id));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (response) {
            setCoordinators(response);
        }
    }, [response]);

    const deleteHandler = (id) => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Class Coordinators</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddDialog(true)}
                >
                    Add Coordinator
                </Button>
            </Box>
            <Paper sx={{ p: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coordinators.map((coordinator) => (
                                <TableRow key={coordinator._id}>
                                    <TableCell>{coordinator.name}</TableCell>
                                    <TableCell>{coordinator.email}</TableCell>
                                    <TableCell>{coordinator.assignedClass.sclassName}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Analytics">
                                            <BlueButton
                                                variant="contained"
                                                onClick={() => {
                                                    // Navigate to coordinator analytics
                                                }}
                                            >
                                                View
                                            </BlueButton>
                                        </Tooltip>
                                        <IconButton onClick={() => deleteHandler(coordinator._id)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Popup
                message={message}
                setShowPopup={setShowPopup}
                showPopup={showPopup}
            />
            <AddCoordinator
                open={showAddDialog}
                handleClose={() => setShowAddDialog(false)}
            />
        </Box>
    );
};

export default ShowCoordinators;
