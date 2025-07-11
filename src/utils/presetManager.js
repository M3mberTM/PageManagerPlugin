import {createDataFolderStruct, readFile} from "./helper";
import {useDispatch} from "react-redux";
import {storage} from 'uxp';
import {PATH_DELIMITER, SETTINGS_FOLDER, SETTINGS_FILE, STORAGE_FOLDER, PROJECT_FILE, PRESET_FILE} from "./constants";
import {setAllStates} from "../redux/settingsSlice";
import {clearLogs, logDecorator} from "./Logger";
import {setSavedNamingPatterns, setSavedProjects} from "../redux/presetSlice";

const fs = storage.localFileSystem;
// tells the program whether the initial loading of all preset files was called
let wasSetUp = false

export const useSetUp = () => {
    // Custom hook for initial setup when loading
    const dispatch = useDispatch() // for some fucking reason, i need to define this here otherwise I am breaking rules of hooks or whatever bla bla
    if (!wasSetUp) {
        wasSetUp = true
        console.log("Doing set up")
        // creates the necessary folders and files if they weren't created yet
        createDataFolderStruct().then(() => {
            loadSettings().then((settings)=> {
                dispatch(setAllStates(settings))
                console.log("Loaded saved settings: ", settings)
            })
            loadSavedProjects().then((projects) => {
                dispatch(setSavedProjects(projects))
                console.log("Loaded saved projects: ", projects)
            })
            loadPresets().then((presets) => {
                dispatch(setSavedNamingPatterns(presets))
                console.log("Loaded saved presets: ", presets)
            })
            clearLogs().then(() => console.log("Cleared logs"))
        })
    } else {
        // console.log("Setup was already called!")
    }
}

const loadSettings = logDecorator(async function loadSettings() {
    const settingsFile = `${SETTINGS_FOLDER}${PATH_DELIMITER}${SETTINGS_FILE}`
    const dataFolder = await fs.getDataFolder()
    const dataFolderPath = dataFolder.nativePath
    const content = await readFile(`${dataFolderPath}${PATH_DELIMITER}${settingsFile}`)
    return JSON.parse(content)
})

const loadSavedProjects = logDecorator(async function loadSavedProjects() {
    const projectFile = `${STORAGE_FOLDER}${PATH_DELIMITER}${PROJECT_FILE}`
    const dataFolder = await fs.getDataFolder()
    const dataFolderPath = dataFolder.nativePath
    const fileContents = await readFile(`${dataFolderPath}${PATH_DELIMITER}${projectFile}`)
    return JSON.parse(fileContents)
})
const loadPresets = logDecorator(async function loadPresets() {
    const presetFile = `${STORAGE_FOLDER}${PATH_DELIMITER}${PRESET_FILE}`
    const dataFolder = await fs.getDataFolder()
    const dataFolderPath = dataFolder.nativePath
    const presetContents = await readFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`)
    return JSON.parse(presetContents)
})
