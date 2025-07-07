import {createSlice} from '@reduxjs/toolkit';

const namingSlice = createSlice({
    name: 'namingSlicer',
    initialState: {namingPattern: ""},
    reducers: {
        setNamingPattern: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const {setNamingPattern} = namingSlice.actions;

export default namingSlice.reducer;
