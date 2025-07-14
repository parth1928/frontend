import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { getClassCoordinators } from '../../../redux/coordinatorRelated/coordinatorHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

const AddCoordinator = ({ open, handleClose }) => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { sclassesList, loading } = useSelector((state) => state.sclass);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        assignedClass: '',
    });

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, 'SclassList'));
    }, [currentUser._id, dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            school: currentUser._id,
            role: 'Coordinator'
        };
        dispatch(addStuff(submitData, 'ClassCoordinator'));
        handleClose();
        // Refresh the coordinators list
        dispatch(getClassCoordinators(currentUser._id));
        setFormData({
            name: '',
            email: '',
            password: '',
            assignedClass: '',
        });
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Add New Class Coordinator</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Assigned Class</InputLabel>
                            <Select
                                name="assignedClass"
                                value={formData.assignedClass}
                                onChange={handleChange}
                                required
                            >
                                {loading ? (
                                    <MenuItem disabled>Loading...</MenuItem>
                                ) : (
                                    sclassesList.map((sclass) => (
                                        <MenuItem key={sclass._id} value={sclass._id}>
                                            {sclass.sclassName}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Add Coordinator'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddCoordinator;
