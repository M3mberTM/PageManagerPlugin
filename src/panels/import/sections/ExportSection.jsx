import React from "react";
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {useSelector, useDispatch} from "react-redux";
import {getTruncatedString} from "../../../utils/helper";
import {logDecorator, syncLogDecorator} from "../../../utils/Logger";
import {setExportDir, setShouldExport} from "../../../redux/fileSystemSlice";
import {setIsFocused} from "../../../redux/utilsSlice";
// noinspection NpmUsedModulesInstalled
import {storage} from 'uxp';

// noinspection JSUnresolvedReference
const fs = storage.localFileSystem;

export const ExportSection = ({dirPlaceholder}) => {

    const dispatch = useDispatch()

    const fsSlicer = useSelector((state) => state.fileSystem)
    const utilSlicer = useSelector((state) => state.utils)

    const exportDir = fsSlicer.exportDir
    const shouldExport = fsSlicer.shouldExport
    const isFocused = utilSlicer.isFocused


    const handleExportCheck = syncLogDecorator(function handleExportCheck ()  {
        dispatch(setShouldExport(!shouldExport))
        console.log(`Export switched to: ${shouldExport}`)
    })

    const getExportFolder = logDecorator(async function getExportFolder()  {
        const folder = await getFolder()

        if (folder === undefined) {
            return
        }

        // noinspection JSUnresolvedReference
        dispatch(setExportDir(folder.nativePath))
        // noinspection JSUnresolvedReference
        console.log("Export folder set: ", folder.nativePath)
    })

    const getFolder = logDecorator(async function getFolder()  {
        dispatch(setIsFocused(false))
        // noinspection JSUnresolvedReference
        const folder = await fs.getFolder();
        dispatch(setIsFocused(true))
        if (folder == null) {
            return
        }
        return folder
    })


    // visual logic
    let shownExportDir = 'Disabled'
    if (shouldExport) {
        shownExportDir = exportDir.length < 1 ? dirPlaceholder : getTruncatedString(30, exportDir)
    }

    // noinspection HtmlUnknownAttribute
    return (
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
    )
}