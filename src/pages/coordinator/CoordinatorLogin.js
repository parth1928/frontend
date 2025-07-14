import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Button,
    TextField,
    Paper,
    Box,
    Grid,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import { SupervisorAccount } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/userRelated/userHandle';
import styled from 'styled-components';

const CoordinatorLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, currentRole, error, response } = useSelector(state => state.user);
    const [loader, setLoader] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(loginUser(formData, 'Coordinator'));
    };

    useEffect(() => {
        if (status === 'success' && currentUser?.role === 'Coordinator') {
            navigate('/coordinator/dashboard');
            setLoader(false);
        }
        else if (status === 'error' || status === 'failed') {
            setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate]);

    return (
        <StyledContainer>
            <StyledPaper elevation={3}>
                <Box
                    sx={{
                        my: 3,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <SupervisorAccount />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Class Coordinator Login
                    </Typography>
                    {(status === 'failed' || status === 'error') && (
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {response || error || "Login failed. Please try again."}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={loader}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={loader}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loader}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : "Login"}
                        </Button>
                        <Grid container justifyContent="center">
                            <Grid item>
                                <Button onClick={() => navigate('/')} color="primary" disabled={loader}>
                                    Go back to home page
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </StyledPaper>
        </StyledContainer>
    );
};

export default CoordinatorLogin;

const StyledContainer = styled.div`
    background: linear-gradient(to bottom, #411d70, #19118b);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
`;

const StyledPaper = styled(Paper)`
    max-width: 500px;
    width: 100%;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.9);
`;
