import {createSlice} from '@reduxjs/toolkit';

const settingsSlice = createSlice({
    name: 'settingsSlicer',
    initialState: {docSaveOnOpen: false, zeroNumbering: true},
    reducers: {
        setDocSaveOnOpen: (state, action) => {
            state.docSaveOnOpen = action.payload;
        },
        setZeroNumbering: (state, action) => {
            state.zeroNumbering = action.payload;
        },
        setAllStates: (state, action) => {
            state.docSaveOnOpen = action.payload.docSaveOnOpen;
            state.zeroNumbering = action.payload.zeroNumbering;
        }
    },
});

export const {setAllStates,  setDocSaveOnOpen, setZeroNumbering} = settingsSlice.actions;

export default settingsSlice.reducer;
