import { configureStore } from '@reduxjs/toolkit';
import utilsSlice from "./utilsSlice";
import settingSlice from "./settingsSlice";
import fileSystemSlice from "./fileSystemSlice";
import namingSlice from './namingSlice'
import presetSlice from './presetSlice'
import pageSlice from "./pageSlice";

const store = configureStore({
    reducer: {
        fileSystem: fileSystemSlice,
        utils: utilsSlice,
        settings: settingSlice,
        naming: namingSlice,
        presets: presetSlice,
        pages: pageSlice
    },
});

export default store;