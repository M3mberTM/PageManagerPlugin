import {createSlice} from '@reduxjs/toolkit';

const presetSlice = createSlice({
    name: 'presetSlicer',
    initialState: {presets: []},
    reducers: {
        setPresets: (state, action) => {
            state.presets = action.payload;
        },
    },
});

export const {setPresets} = presetSlice.actions;

export default presetSlice.reducer;
