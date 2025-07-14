import {createSlice} from '@reduxjs/toolkit';

const utilsSlice = createSlice({
    name: 'helperSlicer',
    initialState: {isFocused: true, isStart: true},
    reducers: {
        setIsFocused: (state, action) => {
            state.isFocused = action.payload;
        },
        setIsStart: (state, action) => {
            state.isStart = action.payload
        }
    },
});

export const {setIsFocused, setIsStart} = utilsSlice.actions;

export default utilsSlice.reducer;
