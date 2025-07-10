import React, {useRef, useState} from "react";
import "../../components/CommonStyles.css";
import {storage} from 'uxp';
import {logDecorator, syncLogDecorator} from "../../utils/Logger";
import {app, core} from "photoshop";
import {getTruncatedString} from "../../utils/helper";

const fs = storage.localFileSystem;

export const ConvertModal = ({dialog, loadedFiles}) => {
    // variable for re-rendering when needed
    const [render, setRender] = useState(false)

    const extension = useRef(undefined)
    const exportFolder = useRef(undefined)
    // file movement refs
    const currentDoc = useRef(undefined)
    const previousDoc = useRef(undefined)

    const rerenderPanel = syncLogDecorator(function rerenderPanel() {
        setRender(!render)
    })

    const setConversionFolder = logDecorator(async function setConversionFolder() {
        exportFolder.current = await fs.getFolder();
        rerenderPanel()
    })

    const handleDropDownChange = (value) => {
        extension.current = value
    }

    const validateAndSend = async () => {
        if (!exportFolder.current) {
            alert("No folder selected")
            return
        }
        if (!extension.current) {
            alert("No extension selected")
            return
        }
        dialog.close()
        await convertFiles(extension.current, exportFolder.current)
    }

    const convertFiles = logDecorator(async function convertFiles(extension, folderEntry) {
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

    const getEntries = syncLogDecorator(function getEntries(filePaths) {
        const promises = filePaths.map(async (item) => {
            return fs.getEntryWithUrl(item)
        })
        return Promise.all(promises)
    })


    const openFile = logDecorator(async function openFile(entry) {
        /*
        Adobe Documentation:
        ExecuteAsModal is needed when a plugin wants to make modifications to the Photoshop state.
        This includes scenarios where the plugin wants to create or modify documents, or the plugin wants to update UI or preference state.
         */
        await core.executeAsModal(async () => {
            previousDoc.current = currentDoc.current
            currentDoc.current = await app.open(entry)
            console.log('Opened doc: ', currentDoc.current)
            if (!previousDoc.current) {
                previousDoc.current = currentDoc.current
            }
        })
    })

    const exportFile = logDecorator(async function exportFile(extension, folder) {
        const fileName = currentDoc.current.name.replace(/\.\w+$/, "")
        switch (extension) {
            case "png":
                await saveAsPng(folder, currentDoc.current, fileName)
                break
            case "jpg":
                await saveAsJpg(folder, currentDoc.current, fileName)
                break
            default:
                console.log("Exporting: Unknown extension")
                break
        }
    })

    const saveAsPng = logDecorator(async function saveAsPng(folder, docToSave, fileName) {
        const pngOptions = {interlaced: false}
        const entry = await folder.createFile(`${fileName}.png`, {overwrite: true})
        // state change in photoshop
        await core.executeAsModal(async () => {
            await docToSave.saveAs.png(entry, pngOptions)
        })
    })

    const saveAsJpg = logDecorator(async function saveAsJpg(folder, docToSave, fileName) {
        const jpgOptions = {quality: 12}
        const entry = await folder.createFile(`${fileName}.jpg`, {overwrite: true})
        // state change in photoshop
        await core.executeAsModal(async () => {
            await docToSave.saveAs.jpg(entry, jpgOptions)
        })
    })

    const closeCurrentFile = logDecorator(async function closeCurrentFile() {
        // state change in photoshop
        await core.executeAsModal(async () => {
            await currentDoc.current.close()
        })
    })
    // some visual logic
    const shownExportFolder = !exportFolder.current ? '' : getTruncatedString(25, exportFolder.current.nativePath)
    return (
        <div id={"convert-modal"} style={{width: '300px'}}>
            <sp-heading style={{marginTop: 0}} size={"S"}>Converting project</sp-heading>
            <sp-heading size={"XS"}>Extension</sp-heading>
            <sp-picker style={{width: "100%"}} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} onClick={(event) => {
                    handleDropDownChange(event.target.value)
                }}>
                    <sp-menu-item value={"png"}> PNG</sp-menu-item>
                    <sp-menu-item value={"jpg"}> JPG</sp-menu-item>
                </sp-menu>
            </sp-picker>
            <sp-heading size={"XS"}>Export folder</sp-heading>
            <sp-body>{shownExportFolder.length < 1 ? "Folder path" : shownExportFolder}</sp-body>
            <sp-action-button class={"button-100"} onClick={setConversionFolder}>Pick export folder</sp-action-button>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={() => dialog.close()}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {
                    validateAndSend().then()
                }}>Ok
                </sp-action-button>
            </div>
        </div>
    )

}