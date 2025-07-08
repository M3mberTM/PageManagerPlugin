import { configureStore } from '@reduxjs/toolkit';
import templateSlice from "./templateSlice";
import helperSlice from "./helperSlice";
import settingSlice from "./settingsSlice";
import projectSlice from "./projectSlice";
import presetSlice from "./presetSlice";
import fileSystemSlice from "./fileSystemSlice";

const store = configureStore({
    reducer: {
        fileSystem: fileSystemSlice,
        templateSlice: templateSlice,
        helper: helperSlice,
        settingsSlice: settingSlice,
        projectSlice: projectSlice,
        presetSlice: presetSlice
    },
});

export default store;