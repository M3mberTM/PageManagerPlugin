import React from 'react';
import {createRoot} from "react-dom";
import {Section} from "../components/Section";
import {useState} from "react";
import "../components/CommonStyles.css";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch} from "react-redux";
import {setImportFolder, setExportFolder, setShouldExport} from "../reducers/folderSlice";
import {ConvertModal} from "../components/ConvertModal";


const fs = require('uxp').storage.localFileSystem;
export const Import = () => {
    const [importPath, setImportPath] = useState(undefined)
    const [exportPath, setExportPath] = useState(undefined)
    const [isExportChecked, setIsExportChecked] = useState(undefined)
    const dispatch = useDispatch()
    let convertDialog = null;

    const getTruncatedString = (maxLength, text) => {
        const actualLength = maxLength - 3
        const textLength = text.length
        console.log(textLength)
        if (textLength > actualLength) {
            return "..." + text.slice(textLength - actualLength, textLength)
        } else {
            return "..." + text
        }
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
        const allFiles = entries.filter(entry => {
            const entryName = entry.name
            return entry.isFile && entryName.substring(entryName.length-3) != "ini"
        })
        dispatch(setFiles(allFiles.map((file, index) => {
            return {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index}
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


    const closeConvertDialog = async () => {
        convertDialog.close()
    }

    const openConvertDialog = async () => {
        if (!convertDialog) {
            convertDialog = document.createElement("dialog")
            convertDialog.style.padding = "1rem"

            const root = createRoot(convertDialog)
            root.render(<ConvertModal dialog={convertDialog} handleClose={closeConvertDialog} />)
        }
        document.body.appendChild(convertDialog)

        convertDialog.onclose = () => {
            convertDialog.remove()
            convertDialog = null
        }

        await convertDialog.uxpShowModal({
            title: "Convert project",
        })
    }

    return <div id={"import"}>
        {/*Importing*/}
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{importPath == null ? "path to directory" : importPath}</sp-body>
            <sp-action-button class={"button-100"}  onClick={() => getImportFolder(setImportPath)}>Choose folder</sp-action-button>
        </Section>
        {/*Exporting*/}
        <Section sectionName={"Export"} isTransparent={true}>
            <div id={"export-details"}>
                <div id={"export-psd"}>
                    <sp-heading size={"S"} class={"heading-style"}>Choose the export folder</sp-heading>
                    <sp-body size={"S"}>Placeholder</sp-body>
                    <div class={"fit-row-style"}>
                    <sp-action-button style={{width: "50%"}} onClick={() => getExportFolder(setExportPath)}>Choose folder</sp-action-button>
                    <sp-action-button  style={{width: "50%"}}>Disable</sp-action-button>
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <sp-action-button class={"button-100"} variant={"primary"} onClick={openConvertDialog}>Convert</sp-action-button>
                </div>
    </div>
}