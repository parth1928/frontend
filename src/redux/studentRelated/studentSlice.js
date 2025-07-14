import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userDetails: null,
    studentsList: [],
    loading: false,
    error: null,
    response: null,
    studentsAttendance: null,
    underControl: false,
    lastFetched: null
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
            state.studentsList = Array.isArray(action.payload) ? action.payload : state.studentsList;
            state.error = null;
            state.response = null;
            state.lastFetched = Date.now();
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
        addStudent: (state, action) => {
            state.loading = false;
            state.error = null;
            if (Array.isArray(action.payload)) {
                state.studentsList = [...state.studentsList, ...action.payload];
            } else {
                state.studentsList = [...state.studentsList, action.payload];
            }
            state.response = "Student(s) added successfully";
        },
        underStudentControl: (state) => {
            state.underControl = !state.underControl;
        },
        stuffDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = "Operation completed successfully";
        },
        clearErrors: (state) => {
            state.error = null;
            state.response = null;
        },
        clearData: (state) => {
            state.userDetails = null;
            state.studentsList = [];
            state.studentsAttendance = null;
            state.error = null;
            state.response = null;
            state.loading = false;
            state.underControl = false;
            state.lastFetched = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getAttendanceSuccess,
    addStudent,
    underStudentControl,
    stuffDone,
    clearErrors,
    clearData
} = studentSlice.actions;

export default studentSlice.reducer;