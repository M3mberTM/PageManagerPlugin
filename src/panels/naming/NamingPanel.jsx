import React from 'react';
import "../../CommonStyles.css";
import {useDispatch} from "react-redux";
import {syncLogDecorator} from "../../utils/Logger";
import {addLeadingZeros} from "../../utils/helper";
import {useSetUp} from "../../utils/presetManager";
import {setNamingPattern} from "../../redux/namingSlice";
import {NamingSection} from "./sections/NamingSection";
import {SavedPatternsSection} from "./sections/SavedPatternsSection";

export const NamingPanel = () => {
    useSetUp()
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1

    const dispatch = useDispatch()

    const applyTemplate = syncLogDecorator(function applyTemplate(inputName)  {
        if (inputName.length < 1) {
            alert("Template is empty")
            return
        }
        const originalNameAppend = inputName.replaceAll("%og%", exampleFilename)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(exampleFileNumber))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = addLeadingZeros(exampleFileNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        return leadingZerosAppend
    })

    const setTemplate = syncLogDecorator(function setTemplate(template) {
        console.log('Setting naming pattern: ', template)
        dispatch(setNamingPattern(template))
    })

    return <div id={"naming"}>
        <NamingSection exampleFilename={exampleFilename} applyTemplate={applyTemplate} setTemplate={setTemplate}/>
        <SavedPatternsSection setTemplate={setTemplate} applyTemplate={applyTemplate}/>
    </div>
}