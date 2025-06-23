import { configureStore } from '@reduxjs/toolkit';
import fileSlice from "./fileSlice";
import templateSlice from "./templateSlice";
import folderSlice from "./folderSlice";
import helperSlice from "./helperSlice";
import settingSlice from "./settingsSlice";

const store = configureStore({
    reducer: {
        fileSlice: fileSlice,
        templateSlice: templateSlice,
        folderSlice: folderSlice,
        helperSlice: helperSlice,
        settingsSlice: settingSlice,
    },
});

export default store;