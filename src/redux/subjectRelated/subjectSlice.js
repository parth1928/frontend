import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    subjectsList: [],
    loading: false,
    error: null,
    response: null,
    deleteSuccess: false,
    deleteError: null,
    deleteLoading: false,
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
        },
        // Delete actions
        deleteRequest: (state) => {
            state.deleteLoading = true;
            state.deleteSuccess = false;
            state.deleteError = null;
        },
        deleteSuccess: (state, action) => {
            state.deleteLoading = false;
            state.deleteSuccess = true;
            state.deleteError = null;
            // If an ID is provided, remove that subject from the list
            if (action.payload) {
                state.subjectsList = state.subjectsList.filter(subject => subject._id !== action.payload);
            } else {
                // If no ID, clear the list (delete all)
                state.subjectsList = [];
            }
        },
        deleteFailed: (state, action) => {
            state.deleteLoading = false;
            state.deleteSuccess = false;
            state.deleteError = action.payload;
        },
        deleteError: (state, action) => {
            state.deleteLoading = false;
            state.deleteSuccess = false;
            state.deleteError = action.payload;
        },
        resetDeleteState: (state) => {
            state.deleteLoading = false;
            state.deleteSuccess = false;
            state.deleteError = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    deleteRequest,
    deleteSuccess,
    deleteFailed,
    deleteError,
    resetDeleteState
} = subjectSlice.actions;

export default subjectSlice.reducer;
