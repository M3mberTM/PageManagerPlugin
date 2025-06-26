import {createSlice} from '@reduxjs/toolkit';

const projectSlice = createSlice({
    name: 'projectSlicer',
    initialState: {savedProjects: {}},
    reducers: {
        setSavedProjects: (state, action) => {
            state.savedProjects = action.payload;
        },
    },
});

export const {setSavedProjects} = projectSlice.actions;

export default projectSlice.reducer;
