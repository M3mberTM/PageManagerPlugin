import React from "react";
import {Section} from "../../../components/section/Section";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useSelector} from "react-redux";

export const InformationSection = ({getPageName, currentPageIndex}) => {

    const fsSlice = useSelector(state => state.fileSystem)
    const utilSlice = useSelector(state => state.utils)

    const isFocused = utilSlice.isFocused
    const isStart = utilSlice.isStart
    const loadedFiles = fsSlice.files

    const pageName = getPageName(loadedFiles[currentPageIndex.current])
    return (
        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                setNewPageNum(document.getElementById("page-number-input").value).then()
            }} isDisabled={isStart || !isFocused}>Set</HighlightButton>
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>{pageName}</sp-heading>
        </Section>
    )
}