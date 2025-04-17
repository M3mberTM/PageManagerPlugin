import React from 'react';
import {createRoot} from "react-dom";
import {Section} from "../components/Section";
import {useState, useEffect} from "react";
import "../components/CommonStyles.css";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch, useSelector} from "react-redux";
import {setImportFolder, setExportFolder, setShouldExport} from "../reducers/folderSlice";
import {ConvertModal} from "../components/ConvertModal";
import {logToFile} from "../components/Logger";

const storage = require("uxp").storage
const fs = storage.localFileSystem;
const app = require("photoshop").app;
const core = require('photoshop').core;

export const Import = () => {
    const [importPath, setImportPath] = useState("")
    const [exportPath, setExportPath] = useState("")
    const [isExportChecked, setIsExportChecked] = useState(true)
    const [fullExportPath, setFullExportPath] = useState("")
    const [directories, setDirectories] = useState({})
    const dirs = useSelector((state) => state.folderSlice.value)
    const dispatch = useDispatch()
    let convertDialog = null;


    useEffect(() => {
        setDirectories(dirs)
    }, [dirs])

    useEffect(() => {
        // automatically sets the export path same as import path when you first select import path to not have to select twice for the same dir
        if (exportPath.length < 1) {
            setExportPath(importPath)
        }
    }, [importPath])

    const getTruncatedString = async (maxLength, text) => {
        try {
            await logToFile(`getTruncatedString(${maxLength}, ${text})`, false)
            const actualLength = maxLength - 3
            const textLength = text.length
            console.log(textLength)
            if (textLength > actualLength) {
                return "..." + text.slice(textLength - actualLength, textLength)
            } else {
                return "..." + text
            }
        } catch (e) {
            await logToFile(`getTruncatedString(${maxLength}, ${text});${e}`, true)
            alert("Function Truncated string")
            alert(e)
        }
    }
    const getFolder = async (setter) => {
        try {
            await logToFile(`getFolder(${setter})`, false)
            console.log("Getting folder")
            const folder = await fs.getFolder();
            if (folder == null) {
                return
            }
            console.log(`Path to folder: ${fs.getNativePath(folder)}`)
            setter(await getTruncatedString(40, folder.nativePath))
            return folder
        } catch(e) {
            await logToFile(`getFolder(${setter});${e}`, true)
            alert("Function get folder")
            alert(e)
        }
    }

    const getFiles = async (setter) => {
        try {
            await logToFile(`getFiles(${setter})`, false)
            console.log("Getting files")
            const files = await fs.getFileForOpening({allowMultiple: true, types: storage.fileTypes.images.concat(["jpeg", "psd", "psb"])})
            if (files.length < 1) {
                return
            }
            const filePath = files[0].nativePath
            const folder= filePath.substring(0,filePath.lastIndexOf("\\"))
            setter(await getTruncatedString(40, folder))
            dispatch(setImportFolder(folder))
            if (directories.exportDir.length < 1) {
                dispatch(setExportFolder(folder))
            }
            setFullExportPath(folder)
            return files
        } catch(e) {
            await logToFile(`getFiles(${setter});${e}`, true)
            alert("Function get files")
            alert(e)
        }
    }

    const getImportFiles = async (setter) => {
        try {
            await logToFile(`getImportFiles(${setter})`, false)
            console.log("Import folder")
            const files = await getFiles(setter)

            if (files == undefined) {
                return
            }
            const allFiles = files.filter(entry => {
                const entryName = entry.name
                return entry.isFile && entryName.substring(entryName.length-3) != "ini"
            })
            dispatch(setFiles(allFiles.map((file, index) => {
                return {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", isDouble: "", pageNumber: index, id:index}
            })))
        } catch(e) {
            await logToFile(`getImportFiles(${setter});${e}`, true)
            alert("Function get Import folder")
            alert(e)
        }
    }

    const getExportFolder = async (setter) => {
        try {
            await logToFile(`getExportFolder(${setter})`, false)
            console.log("Export folder")
            const folder = await getFolder(setter)

            if (folder == undefined) {
                return
            }

            dispatch(setExportFolder(folder.nativePath))
        } catch(e) {
            await logToFile(`getExportFolder(${setter});${e}`, true)
            alert("Function get export folder")
            alert(e)
        }
    }

    const handleExportCheck = async () => {
        try {
            await logToFile(`handleExportCheck()`, false)
            const newExportChecked = !isExportChecked;
            setIsExportChecked(newExportChecked)
            console.log(`Export switched to: ${newExportChecked}`)
            dispatch(setShouldExport(newExportChecked))
        } catch (e) {
            await logToFile(`handleExportCheck();${e}`, true)
            alert("Function handle Export check")
            alert(e)
        }
    }

    const convertFiles = async (extension, folder) => {
        console.log(`Extension: ${extension}`)
        console.log(`Folder: ${folder}`)
        try {
            await logToFile(`convertFiles(${extension}, ${folder})`, false)
            if (folder.length < 1 ) {
                alert("No folder selected")
                return
            }
            if (extension.length < 1) {
                alert("No extension selected")
                return
            }
            await closeConvertDialog()
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
            await logToFile(`convertFiles(${extension}, ${folder});${e}`, true)
            alert("Function convert files")
            alert(e)
        }
    }
    const closeConvertDialog = async () => {
        try {
            await logToFile(`closeConvertDialog()`, false)
            convertDialog.close()
        } catch(e) {
            await logToFile(`closeConvertDialog();${e}`, true)
            alert("Function close convert dialog")
            alert(e)
        }
    }

    const openConvertDialog = async () => {
        try {
            await logToFile(`openConvertDialog()`, false)
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
        } catch(e) {
            await logToFile(`openConvertDialog();${e}`, true)
            alert("Function open convert dialog")
            alert(e)
        }
    }

    const openFile = async (entry) => {
        try {
            await logToFile(`openFile(${entry})`, false)
            await core.executeAsModal(async () => {await app.open(entry)})
        } catch(e) {
            await logToFile(`openFile(${entry});${e}`, true)
            alert("function open file")
            alert(e)
        }
    }

    const exportFile = async (extension, folder) => {
        try {
            await logToFile(`exportFile(${extension}, ${folder})`, false)
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
        } catch(e) {
            await logToFile(`exportFile(${extension}, ${folder});${e}`, true)
            alert("Function export file")
            alert(e)
        }
    }

    const savePng = async (folder) => {
        // put png options here

        try {
            await logToFile(`savePng(${folder})`, false)
            const doc = app.activeDocument
            console.log(doc)
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.png`, {overwrite: true})
            console.log(entry)
            await core.executeAsModal(async () => {await doc.saveAs.png(entry)})
        } catch (e) {
            await logToFile(`savePng(${folder});${e}`, true)
            alert("Function save png")
            alert(e)
        }
    }

    const saveJpg = async (folder) => {
        // put jpg options here
        const jpgOptions = {quality: 12}
        try {
            await logToFile(`saveJpg(${folder})`, false)
            const doc = app.activeDocument
            console.log("CURRENT DOC")
            console.log(doc)
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.jpg`, {overwrite: true})
            console.log(entry)
            await core.executeAsModal(async () => {await doc.saveAs.jpg(entry, jpgOptions)})
        } catch (e) {
            await logToFile(`saveJpg(${folder});${e}`, true)
            alert("Function save jpg")
            alert(e)
        }
    }

    const closeCurrentFile = async () => {
        try {
            await logToFile(`closeCurrentFile()`, false)
            const doc = app.activeDocument
            console.log(doc)
            await core.executeAsModal(async () => {await doc.close()})

        } catch (e) {
            await logToFile(`closeCurrentFile();${e}`, true)
            alert("Function close current file")
            alert(e)
        }
    }

    const getPathValue =  (currentPath) => {
       // Returns a placeholder value for folders if the current path is empty
        try {
            if (currentPath.length < 1) {
                return "Path to folder"
            } else {
                return currentPath
            }
        } catch (e) {
            alert("Function getPathValue")
            alert(e)
        }
    }

    return <div id={"import"}>
        {/*Importing*/}
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{getPathValue(importPath)}</sp-body>
            <sp-action-button class={"button-100"}  onClick={() => getImportFiles(setImportPath)}>Choose Files</sp-action-button>
        </Section>
        {/*Exporting*/}
        <Section sectionName={"Export"} isTransparent={true}>
            <div id={"export-details"}>
                <div id={"export-psd"}>
                    <sp-heading size={"S"} class={"heading-style"}>Choose the export folder</sp-heading>
                    <sp-body size={"S"}>{isExportChecked ? getPathValue(exportPath) : "Disabled"}</sp-body>
                    <div class={"fit-row-style"}>
                        {isExportChecked ?
                            <sp-action-button  class={"width-50"} onClick={handleExportCheck}>Disable</sp-action-button>
                            :
                            <sp-action-button class={"unimportant-button"} style={{width: "50%"}} onClick={handleExportCheck}>Enable</sp-action-button>
                        }
                        <sp-action-button class={"width-50"} onClick={() => getExportFolder(setExportPath)}>Choose folder</sp-action-button>
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <sp-action-button class={"button-100 highlight-button"} onClick={openConvertDialog}>Convert</sp-action-button>
                </div>
    </div>
}