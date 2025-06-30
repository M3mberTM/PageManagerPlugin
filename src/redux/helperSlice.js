import {createSlice} from '@reduxjs/toolkit';

const helperSlice = createSlice({
    name: 'helperSlicer',
    initialState: {isSetUp: false, isFocused: true},
    reducers: {
        setIsSetUp: (state, action) => {
            state.isSetUp = action.payload;
        },
        setIsFocused: (state, action) => {
            state.isFocused = action.payload;
        },
    },
});

export const {setIsSetUp, setIsFocused} = helperSlice.actions;

export default helperSlice.reducer;
