import {createSlice} from '@reduxjs/toolkit';

const utilsSlice = createSlice({
    name: 'helperSlicer',
    initialState: {isSetUp: false, isFocused: true},
    reducers: {
        setIsFocused: (state, action) => {
            state.isFocused = action.payload;
        },
    },
});

export const {setIsFocused} = utilsSlice.actions;

export default utilsSlice.reducer;
