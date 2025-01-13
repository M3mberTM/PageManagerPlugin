import {createSlice} from '@reduxjs/toolkit';

const fileSlice = createSlice({
    name: 'fileSlicer',
    initialState: {value: []},
    reducers: {
        setFiles: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const {setFiles} = fileSlice.actions;

export default fileSlice.reducer;