import {storage} from 'uxp';
import os from "os";

const fs = storage.localFileSystem;
const pathDelimiter = os.platform() == "win32" ? "\\" : "/";

const DATA_FOLDER = await fs.getDataFolder()
const LOG_FOLDER = "logs"
const STORAGE_FOLDER = "storage"
const SETTINGS_FOLDER = "settings"

const DEFAULT_PRESET_VAL = {presets: []}
const DEFAULT_PROJECTS_VAL = {}
const DEFAULT_SETTINGS_VAL = {saveOnOpen: false, rememberState: false}
const LOG = true;

export const showAlert = (message) => {
    if (LOG) {
        alert(message)
    }
}

export const entryExists = async (entryToExist) => {
    try {
        const entry = await fs.getEntryWithUrl(`${entryToExist}`)
        await entry.getMetadata()
        return true
    } catch (e) {
        return false
    }
}

export const createDataFolderStruct = async () => {
    // creates all the folders necessary for the plugin if they don't exist
    console.log("Creating the data folder structure")
    const folderPrefix = `${DATA_FOLDER.nativePath}${pathDelimiter}`
    if (!await entryExists(`${folderPrefix}${LOG_FOLDER}`)) {
        console.info("-----Log folder missing. Creating log folder-----")
        await DATA_FOLDER.createFolder(LOG_FOLDER)
    }
    if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}`)) {
        console.info("-----Storage folder missing. Creating storage folder-----")
        await DATA_FOLDER.createFolder(STORAGE_FOLDER)
    }
    if (!await entryExists(`${folderPrefix}${SETTINGS_FOLDER}`)) {
        console.info("-----Settings folder missing. Creating settings folder-----")
        await DATA_FOLDER.createFolder(SETTINGS_FOLDER)
    }
    await populateDataFolders()
}

const populateDataFolders = async () => {
    /*
    Adds the necessary files into each folder.

    For now, the necessary files are:
    Settings folder -> settings.json
    Storage folder -> presets.json, projects.json

    Logs will be handled separately, as they will be removed and added every x days
     */
    try {
        console.log("populating data folders")
        const folderPrefix = `${DATA_FOLDER.nativePath}${pathDelimiter}`
        if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}${pathDelimiter}presets.json`)) {
            console.info("-----No presets.json found. Creating presets.json-----")
            const storageFolder = await fs.getEntryWithUrl(`${folderPrefix}${STORAGE_FOLDER}`)
            const presetFile  = await storageFolder.createFile("presets.json")
            await presetFile.write(JSON.stringify(DEFAULT_PRESET_VAL))
        }
        if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}${pathDelimiter}projects.json`)) {
            console.info("-----No projects.json found. Creating projects.json-----")
            const storageFolder = await fs.getEntryWithUrl(`${folderPrefix}${STORAGE_FOLDER}`)
            const presetFile  = await storageFolder.createFile("projects.json")
            await presetFile.write(JSON.stringify(DEFAULT_PROJECTS_VAL))
        }
        if (!await entryExists(`${folderPrefix}${SETTINGS_FOLDER}${pathDelimiter}settings.json`)) {
            console.info("-----No settings.json found. Creating settings.json-----")
            const settingsFolder = await fs.getEntryWithUrl(`${folderPrefix}${SETTINGS_FOLDER}`)
            const presetFile  = await settingsFolder.createFile("settings.json")
            await presetFile.write(JSON.stringify(DEFAULT_SETTINGS_VAL))
        }
    } catch(e) {
        alert(e)
    }
}

/* implement writeToFile function
Takes file as an argument
converts the file to entry
writes to file
 */

/* implement appendToFile function
takes file as an argument
Converts the file to entry
appends to the file
 */
