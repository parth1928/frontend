import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userDetails: null,
    loading: false,
    error: null,
    response: null,
    studentsAttendance: null
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.userDetails = action.payload;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = null;
            state.response = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getAttendanceSuccess: (state, action) => {
            state.loading = false;
            state.studentsAttendance = action.payload;
            state.error = null;
            state.response = null;
        },
        clearErrors: (state) => {
            state.error = null;
            state.response = null;
        },
        clearData: (state) => {
            state.userDetails = null;
            state.studentsAttendance = null;
            state.error = null;
            state.response = null;
            state.loading = false;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getAttendanceSuccess,
    clearErrors,
    clearData
} = studentSlice.actions;

export default studentSlice.reducer;