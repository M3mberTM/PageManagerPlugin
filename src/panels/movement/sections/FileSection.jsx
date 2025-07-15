import React, {useRef} from "react";
import {Section} from "../../../components/section/Section";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useDispatch, useSelector} from "react-redux";
import {MovementControls} from "../components/MovementControls";
import {FileList} from "../components/FileList";

export const FileSection = () => {

    const dispatch = useDispatch()
    const utilSlice = useSelector(state => state.utils)
    const fsSlice = useSelector(state => state.fileSystem)

    const isStart = utilSlice.isStart
    const isFocused = utilSlice.isFocused
    const loadedFiles = fsSlice.files

    const completedFilesNum = useRef(0)

    return (
        <Section sectionName={"Files"} isTransparent={true}>
            <div>
                <sp-progressbar max={loadedFiles.length} value={completedFilesNum.current} style={{width: "100%"}}>
                    <sp-label slot={"label"} size={"small"}>Progress:</sp-label>
                </sp-progressbar>
                <FileList files={loadedFiles}/>
            </div>
            <MovementControls isFocused={isFocused}/>
            <div class={"fit-row-style"}>
                <HighlightButton classHandle={"unimportant-button button-100"} clickHandler={() => {
                    // overwriteCheck(currentPageName).then()
                }} isDisabled={isStart || !isFocused}>Save
                </HighlightButton>
            </div>
        </Section>
    )
}