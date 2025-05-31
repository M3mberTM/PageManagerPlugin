import React from 'react';
import {createRoot} from "react-dom";
import {Section} from "../components/Section";
import {useState, useEffect} from "react";
import "../components/CommonStyles.css";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch, useSelector} from "react-redux";
import {setImportFolder, setExportFolder, setShouldExport} from "../reducers/folderSlice";
import {setIsFocused} from "../reducers/focusSlice";
import {ConvertModal} from "../components/ConvertModal";
import {logToFile} from "../components/Logger";
import {storage} from 'uxp';
import {app} from "photoshop";
import {core} from "photoshop";
import os from "os";
import {showAlert} from "../helpers/helperFuncs";

const fs = storage.localFileSystem;
export const Import = () => {
    const [importPath, setImportPath] = useState("")
    const [exportPath, setExportPath] = useState("")
    const [isPanelFocused, setIsPanelFocused] = useState(true)
    const [isExportChecked, setIsExportChecked] = useState(true)
    const [directories, setDirectories] = useState({})

    // Selectors - used to transition information between plugin pages
    const dirs = useSelector((state) => state.folderSlice.value)
    const dirFiles = useSelector(state => state.fileSlice.value)
    const isFocus = useSelector(state => state.focusSlice.value)
    const dispatch = useDispatch()

    // Other helpful variables
    let convertDialog = null; // used for dialogs so that it can be accessed anywhere in code
    const pathDelimiter = os.platform() == "win32" ? "\\" : "/";

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

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
            if (textLength > actualLength) {
                return "..." + text.slice(textLength - actualLength, textLength)
            } else {
                return "..." + text
            }
        } catch (e) {
            await logToFile(`getTruncatedString(${maxLength}, ${text});${e}`, true)
            showAlert("Function Truncated string")
            showAlert(e)
        }
    }
    const getFolder = async (setter) => {
        try {
            await logToFile(`getFolder(${setter})`, false)
            console.log("Getting folder")
            dispatch(setIsFocused(false))
            const folder = await fs.getFolder();
            dispatch(setIsFocused(true))
            if (folder == null) {
                return
            }
            console.log(`Path to folder: ${fs.getNativePath(folder)}`)
            setter(await getTruncatedString(40, folder.nativePath))
            return folder
        } catch(e) {
            await logToFile(`getFolder(${setter});${e}`, true)
            showAlert("Function get folder")
            showAlert(e)
        }
    }

    const getFiles = async (setter) => {
        try {
            await logToFile(`getFiles(${setter})`, false)
            console.log("Getting files")
            const allowedFileExtensions = storage.fileTypes.images.concat(["jpeg", "psd", "psb", "*"])
            dispatch(setIsFocused(false))
            const files = await fs.getFileForOpening({allowMultiple: true, types: allowedFileExtensions})
            dispatch(setIsFocused(true))
            if (files.length < 1) {
                return
            }
            const filteredFiles = files.filter((file)=> {
                const fileName = file.name
                const extension = fileName.substring(fileName.indexOf(".") + 1)
                return allowedFileExtensions.includes(extension);
            })
            if (filteredFiles.length < 1) {
                return
            }
            console.log(filteredFiles)
            const filePath = files[0].nativePath
            const folder= filePath.substring(0,filePath.lastIndexOf(pathDelimiter))
            setter(await getTruncatedString(40, folder))
            dispatch(setImportFolder(folder))
            if (directories.exportDir.length < 1) {
                dispatch(setExportFolder(folder))
            }
            return files
        } catch(e) {
            await logToFile(`getFiles(${setter});${e}`, true)
            showAlert("Function get files")
            showAlert(e)
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
                return {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index, id:index}
            })))
        } catch(e) {
            await logToFile(`getImportFiles(${setter});${e}`, true)
            showAlert("Function get Import folder")
            showAlert(e)
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

            dispatch(setExportFolder(folder.nativePath)) // sets to global variable
        } catch(e) {
            await logToFile(`getExportFolder(${setter});${e}`, true)
            showAlert("Function get export folder")
            showAlert(e)
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
            showAlert("Function handle Export check")
            showAlert(e)
        }
    }

    const getAllEntries = (entriesUrl) => {
        const promises = entriesUrl.map(async (item) => {
            return await fs.getEntryWithUrl(item)
        })
        return Promise.all(promises)
    }
    const convertFiles = async (extension, folder) => {
        console.log("Converting files")
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
            const filenames = dirFiles.map((item)=> {
                return item.filename
            })
            const entries = await getAllEntries(filenames)
            const filteredEntries = entries.filter((file) => {
                return file.isFile && file.name.substring(file.name.length -3) != "ini"
            })
            if (filteredEntries.length < 1) {
                alert("No Files were selected")
                return
            }
            // Main conversion functionality (opening, saving, closing)
            for (let i = 0; i < filteredEntries.length; i++) {
                await openFile(filteredEntries[i])
                await exportFile(extension, folderEntry)
                await closeCurrentFile()
            }
        } catch (e) {
            await logToFile(`convertFiles(${extension}, ${folder});${e}`, true)
            showAlert("Function convert files")
            showAlert(e)
        }
    }
    const closeConvertDialog = async () => {
        try {
            await logToFile(`closeConvertDialog()`, false)
            convertDialog.close()
        } catch(e) {
            await logToFile(`closeConvertDialog();${e}`, true)
            showAlert("Function close convert dialog")
            showAlert(e)
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
            showAlert("Function open convert dialog")
            showAlert(e)
        }
    }

    const openFile = async (entry) => {
        try {
            await logToFile(`openFile(${entry})`, false)
            await core.executeAsModal(async () => {await app.open(entry)})
        } catch(e) {
            await logToFile(`openFile(${entry});${e}`, true)
            showAlert("function open file")
            showAlert(e)
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
            showAlert("Function export file")
            showAlert(e)
        }
    }

    const savePng = async (folder) => {
        // put png options here
        const pngOptions = {interlaced: false}
        try {
            await logToFile(`savePng(${folder})`, false)
            const doc = app.activeDocument
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.png`, {overwrite: true})
            await core.executeAsModal(async () => {await doc.saveAs.png(entry, pngOptions)})
        } catch (e) {
            await logToFile(`savePng(${folder});${e}`, true)
            showAlert("Function save png")
            showAlert(e)
        }
    }

    const saveJpg = async (folder) => {
        // put jpg options here
        const jpgOptions = {quality: 12}
        try {
            await logToFile(`saveJpg(${folder})`, false)
            const doc = app.activeDocument
            const fileName = doc.name.replace(/\.\w+$/, "")
            const entry = await folder.createFile(`${fileName}.jpg`, {overwrite: true})
            await core.executeAsModal(async () => {await doc.saveAs.jpg(entry, jpgOptions)})
        } catch (e) {
            await logToFile(`saveJpg(${folder});${e}`, true)
            showAlert("Function save jpg")
            showAlert(e)
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
            showAlert("Function close current file")
            showAlert(e)
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
            showAlert("Function getPathValue")
            showAlert(e)
        }
    }
    if (!isPanelFocused) {
        return <div id={"import"}>

        </div>
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
                            <sp-action-button class={"width-50"} onClick={handleExportCheck}>Disable</sp-action-button>
                            :
                            <sp-action-button class={"unimportant-button"} style={{width: "50%"}} onClick={handleExportCheck}>Enable</sp-action-button>
                        }
                        {isExportChecked ?
                            <sp-action-button class={"width-50"} onClick={() => getExportFolder(setExportPath)}>Choose folder</sp-action-button>
                            :
                            <sp-action-button class={"width-50"} disabled>Choose folder</sp-action-button>
                        }
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <sp-action-button class={"button-100 unimportant-button"} onClick={openConvertDialog}>Convert</sp-action-button>
                </div>
    </div>
}