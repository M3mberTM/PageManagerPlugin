import { configureStore } from '@reduxjs/toolkit';
import fileSlice from "./fileSlice";
import templateSlice from "./templateSlice";
import folderSlice from "./folderSlice";
import focusSlice from "./focusSlice";

const store = configureStore({
    reducer: {
        fileSlice: fileSlice,
        templateSlice: templateSlice,
        folderSlice: folderSlice,
        focusSlice: focusSlice
    },
});

export default store;