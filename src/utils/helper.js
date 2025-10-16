import {storage} from 'uxp';
import {PATH_DELIMITER, LOG_FOLDER, SETTINGS_FOLDER, LOG, STORAGE_FOLDER, PRESET_FILE, PROJECT_FILE, SETTINGS_FILE} from "./constants";
import {createRoot} from "react-dom/client";
import React from "react";
import {action, app} from 'photoshop';
import {useDispatch} from "react-redux";
import {setNextPageAction, setPreviousPageAction, setSaveAction} from "../redux/actionSlice";

const fs = storage.localFileSystem;
const DEFAULT_PRESET_VAL = []
const DEFAULT_PROJECTS_VAL = {}
const DEFAULT_SETTINGS_VAL = {docSaveOnOpen: false, zeroNumbering: true}

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
    console.log("==========Creating the data folder structure==========")
    const dataFolder = await fs.getDataFolder()
    const folderPrefix = `${dataFolder.nativePath}${PATH_DELIMITER}`
    if (!await entryExists(`${folderPrefix}${LOG_FOLDER}`)) {
        console.info("-----Log folder missing. Creating log folder-----")
        await dataFolder.createFolder(LOG_FOLDER)
    }
    if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}`)) {
        console.info("-----Storage folder missing. Creating storage folder-----")
        await dataFolder.createFolder(STORAGE_FOLDER)
    }
    if (!await entryExists(`${folderPrefix}${SETTINGS_FOLDER}`)) {
        console.info("-----Settings folder missing. Creating settings folder-----")
        await dataFolder.createFolder(SETTINGS_FOLDER)
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
        console.log("==========Populating data folders==========")
        const dataFolder = await fs.getDataFolder()
        const folderPrefix = `${dataFolder.nativePath}${PATH_DELIMITER}`
        if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}${PATH_DELIMITER}${PRESET_FILE}`)) {
            console.info("-----No presets.json found. Creating presets.json-----")
            const storageFolder = await fs.getEntryWithUrl(`${folderPrefix}${STORAGE_FOLDER}`)
            const presetFile  = await storageFolder.createFile(PRESET_FILE)
            await presetFile.write(JSON.stringify(DEFAULT_PRESET_VAL))
        }
        if (!await entryExists(`${folderPrefix}${STORAGE_FOLDER}${PATH_DELIMITER}${PROJECT_FILE}`)) {
            console.info("-----No projects.json found. Creating projects.json-----")
            const storageFolder = await fs.getEntryWithUrl(`${folderPrefix}${STORAGE_FOLDER}`)
            const presetFile  = await storageFolder.createFile(PROJECT_FILE)
            await presetFile.write(JSON.stringify(DEFAULT_PROJECTS_VAL))
        }
        if (!await entryExists(`${folderPrefix}${SETTINGS_FOLDER}${PATH_DELIMITER}${SETTINGS_FILE}`)) {
            console.info("-----No settings.json found. Creating settings.json-----")
            const settingsFolder = await fs.getEntryWithUrl(`${folderPrefix}${SETTINGS_FOLDER}`)
            const presetFile  = await settingsFolder.createFile(SETTINGS_FILE)
            await presetFile.write(JSON.stringify(DEFAULT_SETTINGS_VAL))
        }
    } catch(e) {
        showAlert(e)
    }
}

export const addLeadingZeros = (num, size) =>  {

    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;

}

export const writeToFile = async (filePath, content) => {
    try {
        const fileEntry = await fs.getEntryWithUrl(filePath)
        await fileEntry.write(content, {append: false})
        return true
    } catch (e) {
        showAlert(e)
        return false
    }
}

export const writeToPresetFile = async (content) => {
    try {
        const dataFolder = await fs.getDataFolder()
        const folderPrefix = `${dataFolder.nativePath}${PATH_DELIMITER}`
        const presetFile = await fs.getEntryWithUrl(`${folderPrefix}${STORAGE_FOLDER}${PATH_DELIMITER}${PRESET_FILE}`)
        await presetFile.write(JSON.stringify(content))
        return true
    } catch (e) {
        alert('something went wrong')
        showAlert(e)
        return false
    }
}

export const appendToFile = async (filePath, content) => {
    try {
        const fileEntry = await fs.getEntryWithUrl(filePath)
        await fileEntry.write(content, {append: true})
        return true
    } catch(e) {
        showAlert(e)
        return false
    }
}

export const readFile = async (filePath) => {
    try {
        const fileEntry = await fs.getEntryWithUrl(filePath)
        return await fileEntry.read()
    } catch (e) {
        showAlert(e)
        return undefined
    }
}

export const getTruncatedString = (maxLength, text) => {
    try {
        const actualLength = maxLength - 3
        const textLength = text.length
        if (textLength > actualLength) {
            return "..." + text.slice(textLength - actualLength, textLength)
        } else {
            return "..." + text
        }
    } catch (e) {
       showAlert(e)
    }
}

// connected to spawnDialog method
let dialog = null
export const spawnDialog = async (dialogElement, title) => {
    // there must be a better way of doing this but I couldn't find it
    if (!dialog) {
        dialog = document.createElement("dialog")
        dialog.style.padding = "1rem"

        const root = createRoot(dialog)
        const adjustedElement = React.cloneElement(dialogElement, {dialog: dialog})
        root.render(adjustedElement)
    }
    // thankfully, Photoshop disables the ability to interact with the client until the dialog is gone. No need to worry
    document.body.appendChild(dialog)

    dialog.onclose = () => {
        dialog.remove()
        dialog = null
    }

    await dialog.uxpShowModal({
        title: title,
    })
}

export const spawnActionListener = async () => {
    const dispatch = useDispatch()
    await action.addNotificationListener(['play'], (event, descriptor) => {
        if (!descriptor._isCommand && descriptor._target[0]._name === 'NextPage') {
            dispatch(setNextPageAction())
        } else if (!descriptor._isCommand && descriptor._target[0]._name === 'PreviousPage') {
            dispatch(setPreviousPageAction())
        } else if (!descriptor._isCommand && descriptor._target[0]._name === 'SaveFile') {
            dispatch(setSaveAction())
        } else {
            console.log('Event: ', event, '\nDescriptor: ', descriptor)
        }
    })
}