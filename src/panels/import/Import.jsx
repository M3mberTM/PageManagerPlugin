import React, {useRef} from 'react';
import {createRoot} from "react-dom";
import {Section} from "../../components/section/Section";
import {useState, useEffect} from "react";
import "../../components/CommonStyles.css";
import {useDispatch, useSelector} from "react-redux";
import {setImportDir, setExportDir, setShouldExport, setFiles} from "../../redux/fileSystemSlice";
import {setIsFocused} from "../../redux/helperSlice";
import {ConvertModal} from "../../modals/convert/ConvertModal";
import {logDecorator, asyncLogDecorator} from "../../utils/Logger";
import {storage} from 'uxp';
import {app, core} from "photoshop";
import {PATH_DELIMITER} from "../../utils/constants";
import {ActionButton} from "../../components/actionButton/ActionButton";
import {HighlightButton} from "../../components/highlightButton/HighlightButton";
import {useSetUp} from "../../utils/presetManager";
import {getTruncatedString} from "../../utils/helper";

const fs = storage.localFileSystem;
export const Import = () => {
    useSetUp()

    const dirPlaceholder = 'Path to folder'
    // const [importPath, setImportPath] = useState(defaultFolderPath)
    // const [exportPath, setExportPath] = useState(defaultFolderPath)
    // const [isPanelFocused, setIsPanelFocused] = useState(true)
    // const [isExportChecked, setIsExportChecked] = useState(true)
    // const [directories, setDirectories] = useState({})

    // const dirs = useSelector((state) => state.folderSlice.value)
    // const dirFiles = useSelector(state => state.fileSlice.value)
    // const isFocus = useSelector(state => state.helperSlice.isFocused)

    const helperSlicer = useSelector((state) => state.helperSlice)
    const fsSlicer = useSelector((state) => state.fileSystem)

    const importDir = fsSlicer.importDir
    const exportDir = fsSlicer.exportDir
    const shouldExport = fsSlicer.shouldExport

    const isFocused = helperSlicer.isFocused

    const dispatch = useDispatch()

    const currentConvDoc = useRef(undefined)
    const previousConvDoc = useRef(undefined)

    // Other helpful variables
    let convertDialog = null; // used for dialogs so that it can be accessed anywhere in code

    // useEffect(() => {
    //     setIsPanelFocused(isFocus)
    // }, [isFocus])
    //
    // useEffect(() => {
    //     setDirectories(dirs)
    // }, [dirs])

    // useEffect(() => {
    //     // automatically sets the export path same as import path when you first select import path to not have to select twice for the same dir
    //     if (exportPath === defaultFolderPath) {
    //         setExportPath(importPath)
    //     }
    // }, [importPath])

    const importFiles = logDecorator(async function importFiles ()  {
        /* Main functionality:
        - Makes file dialog.
        - User picks all files he wants to use
        - Sort files based on windows explorer way
        - Create a file Object from each file with necessary information
        - dispatch into the reducer
         */

        // getting files properly
        const files = await getFiles()
        if (files === undefined) {
            return
        }
        const filteredFiles = files.filter(entry => {
            const entryName = entry.name
            return entry.isFile && entryName.substring(entryName.length-3) !== "ini"
        })
        // sorts the files the same way as windows explorer does
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        filteredFiles.sort((a, b) => collator.compare(a.name, b.name))
        console.log("Imported, filtered and sorted files: ", filteredFiles)

        const fileObjects = filteredFiles.map((file, index) => {
            return {filename: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index, id:index}
        })
        dispatch(setFiles(fileObjects))
        // also setting import folder here
        const filePath = filteredFiles[0].nativePath
        const folder= filePath.substring(0,filePath.lastIndexOf(PATH_DELIMITER))
        dispatch(setImportDir(folder))
    })


    const getFiles = logDecorator(async function getFiles ()  {
        /*
        Main functionality:
        - Allow user to pick any allowed files
        - Return the files picked
         */

        const possibleExtensions = storage.fileTypes.images.concat(["jpeg", "psd", "psb"])
        const wildcardExtension = possibleExtensions.join(";*.")
        const allowedFileExtensions = [wildcardExtension].concat(possibleExtensions)
        // for some fucking reason, the user can still interact with the plugin while in file dialog. This disables it
        dispatch(setIsFocused(false))
        const files = await fs.getFileForOpening({allowMultiple: true, types: allowedFileExtensions})
        dispatch(setIsFocused(true))

        if (files.length < 1) {
            return
        }

        return files

    })

    // TODO redo all of the functionality underneath this
    const getFolder = logDecorator(async function getFolder(setter)  {
        console.log("Getting folder")
        dispatch(setIsFocused(false))
        const folder = await fs.getFolder();
        dispatch(setIsFocused(true))
        if (folder == null) {
            return
        }
        console.log(`Path to folder: ${fs.getNativePath(folder)}`)
        setter(getTruncatedString(40, folder.nativePath))
        return folder
    })



    const getExportFolder = logDecorator(async function getExportFolder(setter)  {

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
        console.log("Converting files. Extension: ", extension, " folder: ", folder)

        convertDialog.close()
        const folderEntry = await fs.getEntryWithUrl(folder)
        const filenames = dirFiles.map((item)=> {
            return item.filename
        })
        const entries = await getAllEntries(filenames)
        const filteredEntries = entries.filter((file) => {
            return file.isFile && file.name.substring(file.name.length -3) !== "ini"
        })
        // Main conversion functionality (opening, saving, closing)
        for (let i = 0; i < filteredEntries.length; i++) {
            await openFile(filteredEntries[i])
            await exportFile(extension, folderEntry)
            await closeCurrentFile()
        }

    })
    const openConvertDialog = logDecorator(async function openConvertDialog ()  {
        if (dirFiles.length < 1) {
            alert("No files are loaded!")
            return
        }

        if (!convertDialog) {
            convertDialog = document.createElement("dialog")
            convertDialog.style.padding = "1rem"

            const root = createRoot(convertDialog)
            root.render(<ConvertModal dialog={convertDialog} convert={convertFiles}/>)
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
        await core.executeAsModal(async () => {
            previousConvDoc.current = currentConvDoc.current
            currentConvDoc.current = await app.open(entry)
            if (!previousConvDoc.current) {
                previousConvDoc.current = currentConvDoc.current
            }})
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
        await core.executeAsModal(async () => {await previousConvDoc.current.close()})
    })

    return <div id={"import"}>
        {/*Importing*/}
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{importDir.length < 1 ? dirPlaceholder : getTruncatedString(30, importDir)}</sp-body>
            <ActionButton classHandle={"button-100"}  clickHandler={() => importFiles()} isDisabled={!isFocused}>Choose Files</ActionButton>
        </Section>

        {/*Exporting*/}
        <Section sectionName={"Export"} isTransparent={true}>
            <div id={"export-details"}>
                <div id={"export-psd"}>
                    <sp-heading size={"S"} class={"heading-style"}>Choose the export folder</sp-heading>
                    <sp-body size={"S"}>{exportDir.length < 1 ? dirPlaceholder : getTruncatedString(30, exportDir)}</sp-body>
                    <div class={"fit-row-style"}>
                        {shouldExport ?
                            <ActionButton classHandle={"width-50"} clickHandler={handleExportCheck} isDisabled={!isFocused}>Disable</ActionButton>
                            :
                            <ActionButton classHandle={"unimportant-button"} style={{width: "50%"}} clickHandler={handleExportCheck} isDisabled={!isFocused}>Enable</ActionButton>
                        }
                        <ActionButton classHandle={"width-50"} clickHandler={() => getExportFolder()} isDisabled={!shouldExport || !isFocused}>Choose folder</ActionButton>
                    </div>
                </div>
            </div>
        </Section>
                <div id={"export-other"} style={{marginTop: "10px"}}>
                    <HighlightButton classHandle={"button-100"} clickHandler={openConvertDialog} isDisabled={!isFocused}>Convert</HighlightButton>
                </div>
    </div>
}