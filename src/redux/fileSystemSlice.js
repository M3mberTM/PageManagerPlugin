import {createSlice} from '@reduxjs/toolkit';

const fileSystemSlicer = createSlice({
    name: 'fileSystemSlicer',
    initialState: {files: [], importDir: "", exportDir: "", shouldExport: true},
    reducers: {
        setFiles: (state, action) => {
            state.files = action.payload;
        },
        setImportDir: (state, action) => {
            state.importDir = action.payload;
            if (state.exportDir.length < 1) {
                state.exportDir = action.payload
            }
        },
        setExportDir: (state, action) => {
            state.exportDir = action.payload;
        },
        setShouldExport: (state, action) => {
            state.shouldExport = action.payload
        },
        removeFile: (state, action) => {
            state.files = state.files.filter((file) => file.id !== action.payload)
        }
    },
});

export const {setFiles, setExportDir, removeFile, setImportDir, setShouldExport} = fileSystemSlicer.actions;

export default fileSystemSlicer.reducer;
