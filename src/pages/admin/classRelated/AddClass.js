import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addSclass } from '../../../redux/sclassRelated/sclassHandle';
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, currentUser, error } = useSelector(state => state.user);
    const { loading, response } = useSelector(state => state.sclass);

    const adminID = currentUser._id

    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        sclassName,
        adminID,
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        await dispatch(addSclass(fields));
    };

    useEffect(() => {
        if (status === 'failed' || (response && response.includes("already exists"))) {
            setMessage(response || "Failed to create class");
            setShowPopup(true);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
        }
    }, [status, navigate, error, response]);

    return (
        <>
            <StyledContainer>
                <StyledBox>
                    <Stack sx={{
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <img
                            src={Classroom}
                            alt="classroom"
                            style={{ width: '90%' }}
                        />
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                label="Create a class"
                                variant="outlined"
                                value={sclassName}
                                onChange={(event) => {
                                    setSclassName(event.target.value);
                                }}
                                required
                            />
                            <BlueButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
                            </BlueButton>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddClass

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  max-width: 550px;
  padding: 50px 3rem 50px;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 4px;
`;