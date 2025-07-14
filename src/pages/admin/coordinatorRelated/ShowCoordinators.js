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
    Typography,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { BlueButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import AddCoordinator from './AddCoordinator';
import { getAllCoordinators } from '../../../redux/coordinatorRelated/coordinatorHandle';

const ShowCoordinators = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { coordinatorsList, loading } = useSelector((state) => state.coordinator);
    const [showPopup, setShowPopup] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllCoordinators(currentUser._id));
        }
    }, [dispatch, currentUser]);

    const deleteHandler = (id) => {
        setMessage("Sorry, the delete function has been disabled for now.");
        setShowPopup(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2, mb: 2, mx: 2 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                mt: 2
            }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Class Coordinators
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddDialog(true)}
                    sx={{ 
                        borderRadius: 2,
                        minWidth: '180px'
                    }}
                >
                    Add Coordinator
                </Button>
            </Box>
            
            <Paper sx={{ 
                p: 3,
                borderRadius: 2,
                boxShadow: (theme) => theme.shadows[5]
            }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coordinatorsList && coordinatorsList.length > 0 ? (
                                coordinatorsList.map((coordinator) => (
                                    <TableRow key={coordinator._id}>
                                        <TableCell>{coordinator.name}</TableCell>
                                        <TableCell>{coordinator.email}</TableCell>
                                        <TableCell>{coordinator.assignedClass?.sclassName || 'Not Assigned'}</TableCell>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No coordinators found. Click "Add Coordinator" to add one.
                                    </TableCell>
                                </TableRow>
                            )}
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
