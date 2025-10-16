import React from "react";
import {Section} from "../../../components/section/Section";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useDispatch, useSelector} from "react-redux";
import {setFiles} from "../../../redux/fileSystemSlice";
import {syncLogDecorator} from "../../../utils/Logger";

export const InformationSection = ({getPageName}) => {

    const dispatch = useDispatch()
    const fsSlice = useSelector(state => state.fileSystem)
    const utilSlice = useSelector(state => state.utils)
    const pgSlice = useSelector(state => state.pages)

    const isFocused = utilSlice.isFocused
    const isStart = utilSlice.isStart
    const loadedFiles = fsSlice.files
    const currentIndex = pgSlice.currentIndex

    const setNewPageNum = syncLogDecorator(function setNewPageNum(newPageNum) {
        // manually adjusts the page number of the current file and the files after
        const wantedPageNum = parseInt(newPageNum)
        if (wantedPageNum == NaN) {
            return
        }
        console.log('Parsed number: ', wantedPageNum)
        const ogPage = loadedFiles[currentIndex]
        const pageNumDifference = wantedPageNum - ogPage.pageNumber
        const updatedPage = {...ogPage, pageNumber: ogPage.pageNumber + pageNumDifference}
        const newFiles = loadedFiles.map((item) => {
            if (item.id === updatedPage.id) {
                return updatedPage
            } else if (item.id > updatedPage.id) {
                return {...item, pageNumber: item.pageNumber + pageNumDifference}
            } else {
                return item
            }
        })
        dispatch(setFiles(newFiles))
        console.log("Updated page numbers on current and further files", newFiles)

    })

    const pageName = 'pageName'
    return (
        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                setNewPageNum(document.getElementById("page-number-input").value)
            }} isDisabled={isStart || !isFocused}>Set</HighlightButton>
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>{getPageName(loadedFiles[currentIndex])}</sp-heading>
        </Section>
    )
}