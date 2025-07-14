import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    coordinatorsList: [],
    loading: false,
    error: null,
    response: null,
    currentCoordinator: null
};

const coordinatorSlice = createSlice({
    name: 'coordinator',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.coordinatorsList = action.payload;
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
        setCurrentCoordinator: (state, action) => {
            state.currentCoordinator = action.payload;
            state.error = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    setCurrentCoordinator
} = coordinatorSlice.actions;

export default coordinatorSlice.reducer;
