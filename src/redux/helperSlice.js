import {createSlice} from '@reduxjs/toolkit';

const helperSlice = createSlice({
    name: 'helperSlicer',
    initialState: {isSetUp: false, isFocused: true},
    reducers: {
        setIsFocused: (state, action) => {
            state.isFocused = action.payload;
        },
    },
});

export const {setIsFocused} = helperSlice.actions;

export default helperSlice.reducer;
