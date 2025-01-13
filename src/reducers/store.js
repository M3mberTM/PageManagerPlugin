import { configureStore } from '@reduxjs/toolkit';
import fileSlice from "./fileSlice";
import templateSlice from "./templateSlice";
import folderSlice from "./folderSlice";

const store = configureStore({
    reducer: {
        fileSlice: fileSlice,
        templateSlice: templateSlice,
        folderSlice: folderSlice
    },
});

export default store;