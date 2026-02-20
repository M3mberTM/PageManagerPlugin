import React from "react";
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {getTruncatedString} from "../../../utils/helper";
import {useSelector, useDispatch} from "react-redux";
import {logDecorator} from "../../../utils/Logger";
import {setFiles, setImportDir} from "../../../redux/fileSystemSlice";
import {setIsFocused, setIsStart} from "../../../redux/utilsSlice";
import {PATH_DELIMITER} from "../../../utils/constants";
import {storage} from 'uxp';
import {setCurrentIndex} from "../../../redux/pageSlice";

const fs = storage.localFileSystem;

export const ImportSection = ({dirPlaceholder}) => {

    const dispatch = useDispatch()

    const utilSlicer = useSelector((state) => state.utils)
    const fsSlicer = useSelector((state) => state.fileSystem)
    const settingsSlicer = useSelector(state=> state.settings)

    const importDir = fsSlicer.importDir
    const isFocused = utilSlicer.isFocused
    const zeroNumbering = settingsSlicer.zeroNumbering

    const importFiles = logDecorator(async function importFiles ()  {

        const files = await getFiles()
        if (files === undefined) {
            return
        }
        let pageNumberAddition = 1
        if (zeroNumbering) {
           pageNumberAddition = 0
        }
        // sorts the files the same way as windows explorer does
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        files.sort((a, b) => collator.compare(a.name, b.name))
        console.log("Imported and sorted files: ", files)

        const fileObjects = files.map((file, index) => {
            return {filePath: file.nativePath, name: file.name, isDone: false, exportPath: "", pageNumber: index + pageNumberAddition, id:index}
        })
        dispatch(setFiles(fileObjects))
        dispatch(setIsStart(true))
        dispatch(setCurrentIndex(-1))
        // also setting import folder here
        const filePath = files[0].nativePath
        const folder= filePath.substring(0,filePath.lastIndexOf(PATH_DELIMITER))
        dispatch(setImportDir(folder))
        console.log("Import folder set: ", folder)
    })

    const getFiles = logDecorator(async function getFiles ()  {
        const possibleExtensions = storage.fileTypes.images.concat(["jpeg", "psd", "psb", "tiff", "tif"])
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

    const shownImportDir = importDir.length < 1 ? dirPlaceholder : getTruncatedString(30, importDir)
    return (
        <Section sectionName={"Import"} isTransparent={true}>
            <sp-heading size={"S"} class={"heading-style"}>Choose import directory</sp-heading>
            <sp-body size={"S"}>{shownImportDir}</sp-body>
            <ActionButton classHandle={"button-100"}  clickHandler={() => importFiles()} isDisabled={!isFocused}>Choose Files</ActionButton>
        </Section>
    )
}