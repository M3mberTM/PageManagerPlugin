import {createSlice} from '@reduxjs/toolkit';

const fileSlice = createSlice({
    name: 'fileSlicer',
    initialState: {value: []}, // {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index, id:index}
    reducers: {
        setFiles: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const {setFiles} = fileSlice.actions;

export default fileSlice.reducer;