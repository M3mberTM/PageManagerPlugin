import {createSlice} from '@reduxjs/toolkit';

const actionSlice = createSlice({
    name: 'actionSlicer',
    initialState: {saveAction: false, nextPageAction: false, previousPageAction: false},
    reducers: {
        setPreviousPageAction: (state, action) => {
            state.previousPageAction = !state.previousPageAction
        },
        setNextPageAction: (state, action) => {
            state.nextPageAction = !state.nextPageAction
        },
        setSaveAction: (state, action) => {
            state.saveAction = !state.saveAction
        }
    },
});

export const {setPreviousPageAction, setNextPageAction, setSaveAction} = actionSlice.actions;

export default actionSlice.reducer;
