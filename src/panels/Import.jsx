import React from 'react';
import {useState} from "react";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch} from "react-redux";
import {setImportFolder, setExportFolder, setShouldExport} from "../reducers/folderSlice";

const fs = require('uxp').storage.localFileSystem;
export const Import = () => {
    const [importPath, setImportPath] = useState(undefined)
    const [exportPath, setExportPath] = useState(undefined)
    const [isExportChecked, setIsExportChecked] = useState(undefined)
    const dispatch = useDispatch()

    const getTruncatedString = (maxLength, text) => {
        const actualLength = maxLength - 3
        const textLength = text.length
        return "..." + text.slice(textLength - actualLength, textLength)
    }
    const getFolder = async (setter) => {
        console.log("Getting folder")
        const folder = await fs.getFolder();
        console.log(`Path to folder: ${fs.getNativePath(folder)}`)
        setter(getTruncatedString(80, folder.nativePath))
        return folder
    }
    const getImportFolder = async (setter) => {
        console.log("Import folder")
        const folder = await getFolder(setter)
        const entries = await folder.getEntries()
        const allFiles = entries.filter(entry => entry.isFile)
        dispatch(setFiles(allFiles.map(file => {
            return {filename: file.nativePath, name: file.name, isDone: false}
        })))
        dispatch(setImportFolder(folder.nativePath))
    }

    const getExportFolder = async (setter) => {
        console.log("Export folder")
        const folder = await getFolder(setter)
        dispatch(setExportFolder(folder.nativePath))
    }

    const handleExportCheck = () => {
        const newExportChecked = isExportChecked == null ? true : undefined
        setIsExportChecked(newExportChecked)
        console.log(`Export checkbox changed to: ${isExportChecked}`)
        dispatch(setShouldExport(newExportChecked))
    }

    return <div id={"import"}>
        {/*Heading*/}
        <sp-heading size={"L"}>Import</sp-heading>
        <sp-divider size="small"></sp-divider>

        {/*Importing*/}
        <sp-heading size={"S"}>Choose import directory</sp-heading>
        <sp-body size={"S"}>{importPath == null ? "path to directory" : importPath}</sp-body>
        <sp-button variant={"primary"} onClick={() => getImportFolder(setImportPath)}>Choose folder</sp-button>
        <br/>
        <sp-divider size="medium"></sp-divider>
        {/*Exporting*/}
        <sp-checkbox checked={isExportChecked} onClick={handleExportCheck}>Export files</sp-checkbox>
        {isExportChecked &&
            <div id={"export-details"}>
                <sp-heading size={"S"}>Choose the export folder</sp-heading>
                <sp-body size={"S"}>{exportPath == null ? importPath : exportPath}</sp-body>
                <sp-button variant={"primary"} onClick={() => getExportFolder(setExportPath)}>Choose folder</sp-button>
            </div>
        }
    </div>
}