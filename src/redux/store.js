import { configureStore } from '@reduxjs/toolkit';
import fileSlice from "./fileSlice";
import templateSlice from "./templateSlice";
import folderSlice from "./folderSlice";
import helperSlice from "./helperSlice";
import settingSlice from "./settingsSlice";
import projectSlice from "./projectSlice";
import presetSlice from "./presetSlice";

const store = configureStore({
    reducer: {
        fileSlice: fileSlice,
        templateSlice: templateSlice,
        folderSlice: folderSlice,
        helperSlice: helperSlice,
        settingsSlice: settingSlice,
        projectSlice: projectSlice,
        presetSlice: presetSlice
    },
});

export default store;