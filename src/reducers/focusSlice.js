import { createSlice } from '@reduxjs/toolkit';

const focusSlice = createSlice({
    name: 'focusSlicer',
    initialState: {value: true},
    reducers: {
        setIsFocused: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { setIsFocused } = focusSlice.actions;

export default focusSlice.reducer;
