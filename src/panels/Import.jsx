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
import {logDecorator} from "../helpers/Logger";
import {storage} from 'uxp';
import {app} from "photoshop";
import {core} from "photoshop";
import {PATH_DELIMITER} from "../helpers/constants";
import {ActionButton} from "../components/ActionButton";
import {HighlightButton} from "../components/HighlightButton";

const fs = storage.localFileSystem;
const defaultFolderPath = "Path To Folder"
export const Import = () => {
    const [importPath, setImportPath] = useState(defaultFolderPath)
    const [exportPath, setExportPath] = useState(defaultFolderPath)
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

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    useEffect(() => {
        setDirectories(dirs)
    }, [dirs])

    useEffect(() => {
        // automatically sets the export path same as import path when you first select import path to not have to select twice for the same dir
        if (exportPath === defaultFolderPath) {
            setExportPath(importPath)
        }
    }, [importPath])

    const getTruncatedString = logDecorator(function getTruncatedString(maxLength, text) {

        const actualLength = maxLength - 3
        const textLength = text.length
        if (textLength > actualLength) {
            return "..." + text.slice(textLength - actualLength, textLength)
        } else {
            return "..." + text
        }

    })
    const getFolder = logDecorator(async function getFolder(setter)  {
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
    })

    const getFiles = logDecorator(async function getFiles (setter)  {

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
        const folder= filePath.substring(0,filePath.lastIndexOf(PATH_DELIMITER))
        setter(await getTruncatedString(40, folder))
        dispatch(setImportFolder(folder))
        if (directories.exportDir.length < 1) {
            dispatch(setExportFolder(folder))
        }
        return files
    })

    const getImportFiles = logDecorator(async function getImportFiles (setter)  {

        console.log("Import folder")
        const files = await getFiles(setter)

        if (files === undefined) {
            return
        }
        const allFiles = files.filter(entry => {
            const entryName = entry.name
            return entry.isFile && entryName.substring(entryName.length-3) != "ini"
        })
        dispatch(setFiles(allFiles.map((file, index) => {
            return {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index, id:index}
        })))
    })

    const getExportFolder = logDecorator(async function getExportFolder(setter)  {

        console.log("Export folder")
        const folder = await getFolder(setter)

        if (folder === undefined) {
            return
        }

        dispatch(setExportFolder(folder.nativePath)) // sets to global variable
    })

    const handleExportCheck = logDecorator(function handleExportCheck ()  {

        const newExportChecked = !isExportChecked;
        setIsExportChecked(newExportChecked)
        console.log(`Export switched to: ${newExportChecked}`)
        dispatch(setShouldExport(newExportChecked))

    })

    const getAllEntries = logDecorator(function getAllEntries (entriesUrl)  {
        const promises = entriesUrl.map(async (item) => {
            return await fs.getEntryWithUrl(item)
        })
        return Promise.all(promises)
    })

    const convertFiles = logDecorator(async function convertFiles (extension, folder)  {
        console.log("Converting files")
        console.log(`Extension: ${extension}`)
        console.log(`Folder: ${folder}`)

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

    })
    const closeConvertDialog = logDecorator(function closeConvertDialog ()  {

        convertDialog.close()
    })

    const openConvertDialog = logDecorator(async function openConvertDialog ()  {

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
    })

    const openFile = logDecorator(async function openFile (entry)  {

        await core.executeAsModal(async () => {await app.open(entry)})
    })

    const exportFile = logDecorator(async function exportFile (extension, folder)  {

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
    })

    const savePng = logDecorator(async function savePng (folder)  {
        // put png options here
        const pngOptions = {interlaced: false}

        const doc = app.activeDocument
        const fileName = doc.name.replace(/\.\w+$/, "")
        const entry = await folder.createFile(`${fileName}.png`, {overwrite: true})
        await core.executeAsModal(async () => {await doc.saveAs.png(entry, pngOptions)})

    })

    const saveJpg = logDecorator(async function saveJpg (folder)  {
        // put jpg options here
        const jpgOptions = {quality: 12}

        const doc = app.activeDocument
        const fileName = doc.name.replace(/\.\w+$/, "")
        const entry = await folder.createFile(`${fileName}.jpg`, {overwrite: true})
        await core.executeAsModal(async () => {await doc.saveAs.jpg(entry, jpgOptions)})

    })

    const closeCurrentFile = logDecorator(async function closeCurrentFile ()  {

        const doc = app.activeDocument
        console.log(doc)
        await core.executeAsModal(async () => {await doc.close()})


    })

    return <div id={"import"}>
        {/*Importing*/}
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{importPath}</sp-body>
            <ActionButton classHandle={"button-100"}  clickHandler={() => getImportFiles(setImportPath)} isDisabled={!isPanelFocused}>Choose Files</ActionButton>
        </Section>
        {/*Exporting*/}
        <Section sectionName={"Export"} isTransparent={true}>
            <div id={"export-details"}>
                <div id={"export-psd"}>
                    <sp-heading size={"S"} class={"heading-style"}>Choose the export folder</sp-heading>
                    <sp-body size={"S"}>{isExportChecked ? exportPath : "Disabled"}</sp-body>
                    <div class={"fit-row-style"}>
                        {isExportChecked ?
                            <ActionButton classHandle={"width-50"} clickHandler={handleExportCheck} isDisabled={!isPanelFocused}>Disable</ActionButton>
                            :
                            <ActionButton classHandle={"unimportant-button"} style={{width: "50%"}} clickHandler={handleExportCheck} isDisabled={!isPanelFocused}>Enable</ActionButton>
                        }
                        <ActionButton classHandle={"width-50"} clickHandler={() => getExportFolder(setExportPath)} isDisabled={!isExportChecked || !isPanelFocused}>Choose folder</ActionButton>
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <HighlightButton classHandle={"button-100"} clickHandler={openConvertDialog} isDisabled={!isPanelFocused}>Convert</HighlightButton>
                </div>
    </div>
}