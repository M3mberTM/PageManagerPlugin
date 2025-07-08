import React, {useRef} from 'react';
import {Section} from "../../components/section/Section";
import "../../components/CommonStyles.css";
import {useDispatch, useSelector} from "react-redux";
import {setImportDir, setExportDir, setShouldExport, setFiles} from "../../redux/fileSystemSlice";
import {setIsFocused} from "../../redux/helperSlice";
import {ConvertModal} from "../../modals/convert/ConvertModal";
import {logDecorator, syncLogDecorator} from "../../utils/Logger";
import {storage} from 'uxp';
import {app, core} from "photoshop";
import {PATH_DELIMITER} from "../../utils/constants";
import {ActionButton} from "../../components/actionButton/ActionButton";
import {HighlightButton} from "../../components/highlightButton/HighlightButton";
import {useSetUp} from "../../utils/presetManager";
import {getTruncatedString, spawnDialog} from "../../utils/helper";

const fs = storage.localFileSystem;
export const Import = () => {
    useSetUp()

    const dirPlaceholder = 'Path to folder'
    const helperSlicer = useSelector((state) => state.helper)
    const fsSlicer = useSelector((state) => state.fileSystem)

    const importDir = fsSlicer.importDir
    const exportDir = fsSlicer.exportDir
    const shouldExport = fsSlicer.shouldExport
    const loadedFiles = fsSlicer.files

    const isFocused = helperSlicer.isFocused

    const dispatch = useDispatch()

    const currentDoc = useRef(undefined)
    const previousDoc = useRef(undefined)

    const importFiles = logDecorator(async function importFiles ()  {

        const files = await getFiles()
        if (files === undefined) {
            return
        }
        // sorts the files the same way as windows explorer does
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        files.sort((a, b) => collator.compare(a.name, b.name))
        console.log("Imported and sorted files: ", files)

        const fileObjects = files.map((file, index) => {
            return {filePath: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index, id:index}
        })
        dispatch(setFiles(fileObjects))
        // also setting import folder here
        const filePath = files[0].nativePath
        const folder= filePath.substring(0,filePath.lastIndexOf(PATH_DELIMITER))
        dispatch(setImportDir(folder))
        console.log("Import folder set: ", folder)
    })


    const getFiles = logDecorator(async function getFiles ()  {
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

    const handleExportCheck = syncLogDecorator(function handleExportCheck ()  {
        dispatch(setShouldExport(!shouldExport))
        console.log(`Export switched to: ${shouldExport}`)
    })

    const getExportFolder = logDecorator(async function getExportFolder()  {
        const folder = await getFolder()

        if (folder === undefined) {
            return
        }

        dispatch(setExportDir(folder.nativePath))
        console.log("Export folder set: ", folder.nativePath)
    })

    const getFolder = logDecorator(async function getFolder()  {
        dispatch(setIsFocused(false))
        const folder = await fs.getFolder();
        dispatch(setIsFocused(true))
        if (folder == null) {
            return
        }
        return folder
    })

    // Convert dialog methods from here on
    const openConvertDialog = logDecorator(async function openConvertDialog ()  {
        if (loadedFiles.length < 1) {
            alert("No files are loaded!")
            return
        }
        await spawnDialog(<ConvertModal convertFiles={convertFiles}/>, 'Convert project')
    })

    // consider moving these methods into the dialog
    const convertFiles = logDecorator(async function convertFiles (extension, folderEntry)  {
        console.group("=====CONVERTING FILES=====")
        console.log("Extension: ", extension)
        console.log("Folder: ", folderEntry)

        const filenames = loadedFiles.map((item) => {
            return item.filePath
        })
        const fileEntries = await getEntries(filenames)
        // Main conversion functionality (opening, saving, closing)
        for (let i = 0; i < fileEntries.length; i++) {
            await openFile(fileEntries[i])
            await exportFile(extension, folderEntry)
            await closeCurrentFile()
        }
        console.groupEnd()

    })

    const getEntries = syncLogDecorator(function getEntries (filePaths)  {
        const promises = filePaths.map(async (item) => {
            return fs.getEntryWithUrl(item)
        })
        return Promise.all(promises)
    })


    const openFile = logDecorator(async function openFile (entry)  {
        /*
        Adobe Documentation:
        ExecuteAsModal is needed when a plugin wants to make modifications to the Photoshop state.
        This includes scenarios where the plugin wants to create or modify documents, or the plugin wants to update UI or preference state.
         */
        await core.executeAsModal(async () => {
            previousDoc.current = currentDoc.current
            currentDoc.current = await app.open(entry)
            if (!previousDoc.current) {
                previousDoc.current = currentDoc.current
            }})
    })

    const exportFile = logDecorator(async function exportFile (extension, folder)  {

        switch (extension) {
            case "png":
                await savePng(folder)
                break
            case "jpg":
                await saveJpg(folder)
                break
            default:
                console.log("Unknown extension")
                break
        }
    })
    // TODO redo all of the functionality underneath this




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
        await core.executeAsModal(async () => {await previousDoc.current.close()})
    })

    const shownImportDir = importDir.length < 1 ? dirPlaceholder : getTruncatedString(30, importDir)
    let shownExportDir = 'Disabled'
    if (shouldExport) {
        shownExportDir = exportDir.length < 1 ? dirPlaceholder : getTruncatedString(30, exportDir)
    }

    return <div id={"import"}>
        {/*Importing*/}
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{shownImportDir}</sp-body>
            <ActionButton classHandle={"button-100"}  clickHandler={() => importFiles()} isDisabled={!isFocused}>Choose Files</ActionButton>
        </Section>

        {/*Exporting*/}
        <Section sectionName={"Export"} isTransparent={true}>
            <div id={"export-details"}>
                <div id={"export-psd"}>
                    <sp-heading size={"S"} class={"heading-style"}>Choose the export folder</sp-heading>
                    <sp-body size={"S"}>{shownExportDir}</sp-body>
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