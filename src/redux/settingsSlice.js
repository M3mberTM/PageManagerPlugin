import {createSlice} from '@reduxjs/toolkit';

const settingsSlice = createSlice({
    name: 'settingsSlicer',
    initialState: {saveBetweenClose: false, docSaveOnOpen: false, zeroNumbering: true},
    reducers: {
        setSaveBetweenClose: (state, action) => {
            state.saveBetweenClose = action.payload;
        },
        setDocSaveOnOpen: (state, action) => {
            state.docSaveOnOpen = action.payload;
        },
        setZeroNumbering: (state, action) => {
            state.zeroNumbering = action.payload;
        },
        setAllStates: (state, action) => {
            state.saveBetweenClose = action.payload.saveBetweenClose;
            state.docSaveOnOpen = action.payload.docSaveOnOpen;
            state.zeroNumbering = action.payload.zeroNumbering;
        }
    },
});

export const {setAllStates, setSaveBetweenClose, setDocSaveOnOpen, setZeroNumbering} = settingsSlice.actions;

export default settingsSlice.reducer;
