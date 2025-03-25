import React from 'react';
import "./Naming.css";
import "../components/CommonStyles.css";
import {useState, useEffect, useRef} from "react";
import {Section} from "../components/Section";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch} from "react-redux";
import {createRoot} from "react-dom";
import {GuideModal} from "../components/GuideModal";

export const Naming = () => {
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1
    const [shownName, setShownName] = useState("")
    const dispatch = useDispatch()
    let guideDialog = null;

    const addLeadingZeros = (num, size) => {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    const handleInputChange = (inputName) => {
        console.log(inputName);
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

    const closeGuideDialog = async () => {
        guideDialog.close()
    }

    const openGuideDialog = async () => {
        if (!guideDialog) {
            guideDialog = document.createElement("dialog")
            guideDialog.style.padding = "1rem"

            const root = createRoot(guideDialog)
            root.render(<GuideModal dialog={guideDialog} handleClose={closeGuideDialog} />)
        }
        document.body.appendChild(guideDialog)

        guideDialog.onclose = () => {
            guideDialog.remove()
            guideDialog = null
        }

        await guideDialog.uxpShowModal({
            title: "Template guide",
        })
    }

    return <div id={"naming"}>
        {/*Heading*/}
        <Section sectionName={"Naming"} isTransparent={true}>
            {/*

            Command outline = %command% <br/>
            Original name = og <br/>
            Page number = num <br/>
            Add leading zeros = an | where n represents the amount of zeros
            */}

            <sp-heading size={"XXS"}>{shownName.length < 1 ? "FileName001" : shownName}</sp-heading>
            <sp-textfield class={"button-100"}></sp-textfield>
            <sp-action-button class={"button-100"}>Set</sp-action-button>
            <sp-action-button class={"button-100"} onClick={openGuideDialog}>Guide</sp-action-button>
        </Section>

        <Section isTransparent={true} sectionName={"Presets"}>
            <div class={"heading-style"}>
                <div class={"fit-row-style"}>
                    <sp-action-button style={{width: "50%"}}>Load</sp-action-button>
                    <sp-action-button style={{width: "50%"}}>Remove</sp-action-button>
                </div>
                <sp-action-button class={"button-100"}>Save preset</sp-action-button>
            </div>
        </Section>
    </div>
}