import React from 'react';
import "./Naming.css"
import {useState} from "react";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch} from "react-redux";

export const Naming = () => {
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1
    const [isCheatsheet, setIsCheatsheet] = useState(undefined)
    const [shownName, setShownName] = useState("")
    const dispatch = useDispatch()

    const handleCheatsheetCheck = () => {
        setIsCheatsheet(isCheatsheet == null ? true : undefined)
        console.log(`Cheatsheet checkbox changed to: ${isCheatsheet}`)
    }

   const addLeadingZeros = (num, size) => {
       num = num.toString();
       while (num.length < size) num = "0" + num;
       return num;
   }

    const handleInputChange = (inputName) => {
        try {
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

            setShownName(leadingZerosAppend)
            dispatch(setTemplate(inputName))
        } catch (e) {
            console.log(e)
        }
    }
    return <div id={"naming"}>
        <sp-heading size={"L"}>Naming</sp-heading>
        <sp-divider size="small"></sp-divider>

        <sp-checkbox checked={isCheatsheet} onClick={handleCheatsheetCheck}>Show Cheatsheet</sp-checkbox>
        <br/>
        {isCheatsheet &&
            <p size={"S"} id={"cheatsheet"}>
                Example filename: FileName001
                Command outline = %command% <br/>
                Original name = og <br/>
                Page number = num <br/>
                Add leading zeros = an | where n represents the amount of zeros
            </p>
        }
        <br/>
        <input type={"text"} onChange={e => handleInputChange(e.target.value)}/>
        <sp-body>Naming template here</sp-body>
        <sp-heading size={"XXS"}>{shownName}</sp-heading>
    </div>
}