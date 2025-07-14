import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    subjectsList: [],
    loading: false,
    error: null,
    response: null,
};

const subjectSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.subjectsList = action.payload;
            state.error = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
} = subjectSlice.actions;

export default subjectSlice.reducer;
