import {createSlice} from '@reduxjs/toolkit';

const presetSlice = createSlice({
    name: 'presetSlicer',
    initialState: {savedProjects: [], savedNamingPatterns: []},
    reducers: {
        setSavedProjects: (state, action) => {
            state.savedProjects = action.payload;
        },
        setSavedNamingPatterns: (state, action) => {
            state.savedNamingPatterns = action.payload;
        },
        saveProject: (state, action) => {
            state.savedProjects = state.savedProjects.concat(action.payload)
        },
        saveNamingPattern: (state, action) => {
            state.savedNamingPatterns = state.savedNamingPatterns.concat(action.payload)
        },
    },
});

export const {setSavedNamingPatterns, setSavedProjects,
    saveNamingPattern,
    saveProject} = presetSlice.actions;

export default presetSlice.reducer;