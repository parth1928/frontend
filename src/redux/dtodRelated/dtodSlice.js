import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    dtodStudentsList: [],
    loading: false,
    error: null,
    response: null,
};

const dtodSlice = createSlice({
    name: 'dtod',
    initialState,
    reducers: {
        getDtodRequest: (state) => {
            state.loading = true;
        },
        getDtodSuccess: (state, action) => {
            state.dtodStudentsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getDtodFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getDtodError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    getDtodRequest,
    getDtodSuccess,
    getDtodFailed,
    getDtodError,
} = dtodSlice.actions;

export const dtodReducer = dtodSlice.reducer;
