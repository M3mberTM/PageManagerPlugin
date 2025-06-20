import { configureStore } from '@reduxjs/toolkit';
import fileSlice from "./fileSlice";
import templateSlice from "./templateSlice";
import folderSlice from "./folderSlice";
import helperSlice from "./helperSlice";
import storageSlice from "./storageSlice";

const store = configureStore({
    reducer: {
        fileSlice: fileSlice,
        templateSlice: templateSlice,
        folderSlice: folderSlice,
        helperSlice: helperSlice,
        storageSlice: storageSlice,
    },
});

export default store;