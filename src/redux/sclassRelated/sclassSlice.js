import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sclassesList: [],
    sclassStudents: [],
    currentClass: null,
    subjectsList: [],
    subjectDetails: [],
    loading: false,
    subloading: false,
    error: null,
    response: null,
    getresponse: null,
    status: 'idle'
};

const sclassSlice = createSlice({
    name: 'sclass',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.status = 'loading';
        },
        getSubDetailsRequest: (state) => {
            state.subloading = true;
        },
        getSuccess: (state, action) => {
            state.sclassesList = action.payload;
            state.loading = false;
            state.error = null;
            state.getresponse = null;
            state.status = 'succeeded';
        },
        addClass: (state, action) => {
            state.sclassesList = [...state.sclassesList, action.payload];
            state.loading = false;
            state.error = null;
            state.response = null;
            state.status = 'added';
        },
        getStudentsSuccess: (state, action) => {
            state.sclassStudents = action.payload;
            state.loading = false;
            state.error = null;
            state.getresponse = null;
            state.status = 'succeeded';
        },
        getSubjectsSuccess: (state, action) => {
            state.subjectsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'failed';
        },
        getFailedTwo: (state, action) => {
            state.getresponse = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'failed';
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.status = 'failed';
        },
        detailsSuccess: (state, action) => {
            state.currentClass = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'succeeded';
            console.log('Class details updated:', action.payload);
        },
        getSubDetailsSuccess: (state, action) => {
            state.subjectDetails = action.payload;
            state.subloading = false;
            state.error = null;
        },
        resetSubjects: (state) => {
            state.subjectsList = [];
            state.sclassesList = [];
        },
        clearClassData: (state) => {
            state.sclassStudents = [];
            state.currentClass = null;
            state.error = null;
            state.response = null;
            state.status = 'idle';
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    getSubjectsSuccess,
    detailsSuccess,
    getFailedTwo,
    resetSubjects,
    getSubDetailsSuccess,
    getSubDetailsRequest,
    addClass,
    clearClassData
} = sclassSlice.actions;

export const sclassReducer = sclassSlice.reducer;