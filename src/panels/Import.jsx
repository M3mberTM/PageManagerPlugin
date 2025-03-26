import React from 'react';
import {createRoot} from "react-dom";
import {Section} from "../components/Section";
import {useState, useEffect} from "react";
import "../components/CommonStyles.css";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch, useSelector} from "react-redux";
import {setImportFolder, setExportFolder, setShouldExport} from "../reducers/folderSlice";
import {ConvertModal} from "../components/ConvertModal";


const fs = require('uxp').storage.localFileSystem;
const app = require("photoshop").app;
const core = require('photoshop').core;

export const Import = () => {
    const [importPath, setImportPath] = useState(undefined)
    const [exportPath, setExportPath] = useState(undefined)
    const [isExportChecked, setIsExportChecked] = useState(true)
    const [fullExportPath, setFullExportPath] = useState("")
    const dispatch = useDispatch()
    let convertDialog = null;

    useEffect(() => {
        if (exportPath == undefined) {
            setExportPath(importPath)
        }
    }, [importPath])

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
        setter(getTruncatedString(40, folder.nativePath))
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
        setFullExportPath(folder.nativePath)
    }

    const getExportFolder = async (setter) => {
        console.log("Export folder")
        const folder = await getFolder(setter)
        dispatch(setExportFolder(folder.nativePath))
    }

    const handleExportCheck = () => {
        const newExportChecked = !isExportChecked;
        setIsExportChecked(newExportChecked)
        console.log(`Export switched to: ${newExportChecked}`)
        dispatch(setShouldExport(newExportChecked))
    }

    const convertFiles = async (extension, folder) => {
        console.log(`Extension: ${extension}`)
        console.log(`Folder: ${folder}`)
        await closeConvertDialog()

        try {
            const folderEntry = await fs.getEntryWithUrl(folder)
            const importFolderEntry = await fs.getEntryWithUrl(fullExportPath)
            const entries = await importFolderEntry.getEntries()
            const filteredEntries = entries.filter((file) => {
                return file.isFile && file.name.substring(file.name.length -3) != "ini"
            })

            // Main conversion functionality (opening, saving, closing)
            for (let i = 0; i < filteredEntries.length; i++) {
                await openFile(filteredEntries[i])
                await exportFile(extension, folderEntry)
                await closeCurrentFile()
            }
        } catch (e) {
            console.log(e)
        }
    }
    const closeConvertDialog = async () => {
        convertDialog.close()
    }

    const openConvertDialog = async () => {
        if (!convertDialog) {
            convertDialog = document.createElement("dialog")
            convertDialog.style.padding = "1rem"

            const root = createRoot(convertDialog)
            root.render(<ConvertModal dialog={convertDialog} handleClose={closeConvertDialog} convert={convertFiles}/>)
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

    const openFile = async (entry) => {
        try {
            await core.executeAsModal(async () => {await app.open(entry)})
        } catch(e) {
            console.log(e)
        }
    }

    const exportFile = async (extension, folder) => {

        switch (extension) {
            case "png":
                // Export into png function
                console.log("png conversion")
                await savePng(folder)
                break
            case "jpg":
                // export into jpg function
                console.log("jpg conversion")
                await saveJpg(folder)
                break
            default:
                console.log("Unknown extension")
                break
        }
    }

    const savePng = async (folder) => {
        // put png options here

        try {
            const doc = app.activeDocument
            console.log(doc)
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.png`, {overwrite: true})
            console.log(entry)
            await core.executeAsModal(async () => {await doc.saveAs.png(entry)})
        } catch (e) {
            console.log(e)
        }
    }

    const saveJpg = async (folder) => {
        // put jpg options here
        const jpgOptions = {quality: 12}
        try {
            const doc = app.activeDocument
            console.log("CURRENT DOC")
            console.log(doc)
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.jpg`, {overwrite: true})
            console.log(entry)
            await core.executeAsModal(async () => {await doc.saveAs.jpg(entry, jpgOptions)})
        } catch (e) {
            console.log("SAVE JPG")
            console.log(e)
        }
    }

    const closeCurrentFile = async () => {
        try {
            const doc = app.activeDocument
            console.log(doc)
            await core.executeAsModal(async () => {await doc.close()})

        } catch (e) {
            console.log(e)
        }
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
                    <sp-body size={"S"}>{isExportChecked ? exportPath : "Disabled"}</sp-body>
                    <div class={"fit-row-style"}>
                    <sp-action-button style={{width: "50%"}} onClick={() => getExportFolder(setExportPath)}>Choose folder</sp-action-button>
                        {isExportChecked ?
                            <sp-action-button  style={{width: "50%"}} onClick={handleExportCheck}>Disable</sp-action-button>
                            :
                            <sp-action-button class={"unimportant-button"} style={{width: "50%"}} onClick={handleExportCheck}>Enable</sp-action-button>
                        }
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <sp-action-button class={"button-100"} variant={"primary"} onClick={openConvertDialog}>Convert</sp-action-button>
                </div>
    </div>
}