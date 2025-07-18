import {createSlice} from '@reduxjs/toolkit';

const pageSlice = createSlice({
    name: 'pageSlicer',
    initialState: {currentIndex: -1, currentPage: {} },
    reducers: {
        setCurrentIndex: (state, action) => {
            state.currentIndex = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },
})

export const {setCurrentIndex, setCurrentPage} = pageSlice.actions;

export default pageSlice.reducer;
