import React from 'react';
import "./Movement.css";
import "../../CommonStyles.css";
import {useSelector} from "react-redux";
import {syncLogDecorator} from "../../utils/Logger";
import {useSetUp} from "../../utils/presetManager";
import {FileSection} from "./sections/FileSection";
import {SavedProjectsSection} from "./sections/SavedProjectsSection";
import {InformationSection} from "./sections/InformationSection";


export const MovementPanel = () => {
    useSetUp()
    const namingSlice = useSelector(state => state.naming)

    const namingPattern = namingSlice.namingPattern

    const getPageName = syncLogDecorator(function getPageName(currentPage) {
        if (!currentPage) {
            return 'Page name'
        }
        // if there is no template, just use the normal page name
        if (namingPattern.length < 1) {
            return currentPage.name.replace(/\.[\w\d]+$/, "")
        }
        // if there is template, replace each specific pattern for it's part
        const originalNameAppend = namingPattern.replaceAll("%og%", currentPage.name)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(currentPage.pageNumber))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = addLeadingZeros(currentPage.pageNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        return leadingZerosAppend.replace(/\.[\w\d]+$/, "")

    })

    const addLeadingZeros = syncLogDecorator(function addLeadingZeros(num, size) {
        return String(num).padStart(size, '0')
    })

    return <div id={"export"}>
        <FileSection getPageName={getPageName}/>
        <InformationSection getPageName={getPageName}/>
        <SavedProjectsSection/>
    </div>
}