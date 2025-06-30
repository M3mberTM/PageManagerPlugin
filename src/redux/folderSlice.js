import {createSlice} from '@reduxjs/toolkit';

const folderSlice = createSlice({
    name: 'folderSlicer',
    initialState: {value: {importDir: "", exportDir: "", shouldExport: true}},
    reducers: {
        setImportFolder: (state, action) => {
            state.value.importDir = action.payload;
        },
        setExportFolder: (state, action) => {
            state.value.exportDir = action.payload;
        },
        setShouldExport: (state, action) => {
            state.value.shouldExport = action.payload
        }
    },
});

export const {setImportFolder, setExportFolder, setShouldExport} = folderSlice.actions;

export default folderSlice.reducer;
