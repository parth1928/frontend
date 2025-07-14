import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';

const AssignCoordinator = ({ classId, className }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, status, response } = useSelector((state) => state.user);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fields = {
        name,
        email,
        password,
        role: 'Coordinator',
        school: currentUser._id,
        assignedClass: classId
    };

    const submitHandler = (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(registerUser(fields, 'Coordinator'));
    };

    React.useEffect(() => {
        if (status === 'added') {
            navigate('/Admin/classes');
            setLoading(false);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoading(false);
        }
    }, [status, navigate, response]);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    Assign Coordinator to {className}
                </Typography>
                <form onSubmit={submitHandler}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Assign Coordinator'}
                    </Button>
                </form>
            </Paper>
            <Popup
                message={message}
                setShowPopup={setShowPopup}
                showPopup={showPopup}
            />
        </Box>
    );
};

export default AssignCoordinator;
