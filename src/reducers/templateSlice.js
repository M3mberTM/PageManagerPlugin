import { createSlice } from '@reduxjs/toolkit';

const templateSlice = createSlice({
    name: 'templateSlicer',
    initialState: { value: "" },
    reducers: {
        setTemplate: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { setTemplate } = templateSlice.actions;

export default templateSlice.reducer;