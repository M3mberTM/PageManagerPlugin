import React from 'react';
// import "../../CommonStyles.css";
import {useSelector} from "react-redux";
import {ConvertModal} from "../../modals/convert/ConvertModal";
import {logDecorator} from "../../utils/Logger";
import {HighlightButton} from "../../components/typography/HighlightButton";
import {useSetUp} from "../../utils/presetManager";
import {spawnDialog} from "../../utils/helper";
import {ImportSection} from "./sections/ImportSection";
import {ExportSection} from "./sections/ExportSection";

export const ImportPanel = () => {
    useSetUp()

    const dirPlaceholder = 'Path to folder'
    const utilSlicer = useSelector((state) => state.utils)
    const fsSlicer = useSelector((state) => state.fileSystem)

    const loadedFiles = fsSlicer.files

    const isFocused = utilSlicer.isFocused

    // Convert dialog methods from here on
    const openConvertDialog = logDecorator(async function openConvertDialog ()  {
        if (loadedFiles.length < 1) {
            alert("No files are loaded!")
            return
        }
        await spawnDialog(<ConvertModal loadedFiles={loadedFiles}/>, 'Convert project')
    })


    return <div id={"import"}>
        {/*Importing*/}
        <ImportSection dirPlaceholder={dirPlaceholder}/>
        {/*Exporting*/}
        <ExportSection dirPlaceholder={dirPlaceholder}/>
        <div id={"export-other"} style={{marginTop: "10px"}}>
            <HighlightButton classHandle={"button-100"} clickHandler={openConvertDialog} isDisabled={!isFocused}>Convert</HighlightButton>
        </div>
    </div>
}