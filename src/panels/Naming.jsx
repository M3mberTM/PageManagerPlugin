import React from 'react';
import "./Naming.css";
import "../components/CommonStyles.css";
import {useState, useEffect} from "react";
import {Section} from "../components/Section";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch} from "react-redux";
import {createRoot} from "react-dom";
import {GuideModal} from "../components/GuideModal";

const fs = require('uxp').storage.localFileSystem;

export const Naming = () => {
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1
    const [shownName, setShownName] = useState("")
    const [presets, setPresets] = useState([])
    const dispatch = useDispatch()
    let guideDialog = null;
    const presetFileName = 'presets.txt'

    useEffect(async () => {
        // load the preset file saved before starting anything
        const presetContents = await getPresetFileContents()
        console.log(presetContents.presets)
        setPresets(presetContents.presets)
    }, [])

    const addLeadingZeros = (num, size) => {
        try {
            num = num.toString();
            while (num.length < size) num = "0" + num;
            return num;
        } catch (e) {
            alert("Function add leading zeros")
            alert(e)
        }
    }

    const applyTemplate = (inputName) => {
        console.log(inputName);
        try {
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

            setShownName(leadingZerosAppend)
            dispatch(setTemplate(inputName)) // sets to global variable
        } catch (e) {
            alert("Function handle Input change")
            alert(e)
        }
    }

    const closeGuideDialog = async () => {
        try {
            guideDialog.close()
        } catch (e) {
            alert("Function close guide dialog")
            alert(e)
        }
    }

    const openGuideDialog = async () => {
        try {
            if (!guideDialog) {
                guideDialog = document.createElement("dialog")
                guideDialog.style.padding = "1rem"

                const root = createRoot(guideDialog)
                root.render(<GuideModal dialog={guideDialog} handleClose={closeGuideDialog}/>)
            }
            document.body.appendChild(guideDialog)

            guideDialog.onclose = () => {
                guideDialog.remove()
                guideDialog = null
            }

            await guideDialog.uxpShowModal({
                title: "Template guide",
            })
        } catch (e) {
            alert("Function open guide dialog")
            alert(e)
        }
    }

    const getPresetFileContents = async () => {
        try {
            const dataFolder = await fs.getDataFolder()
            console.log(dataFolder.nativePath)
            if (await doesFileExits(presetFileName)) {
                const presetFile = await dataFolder.getEntry(presetFileName)
                const fileContent = await presetFile.read()
                console.log(JSON.parse(fileContent))
                return JSON.parse(fileContent)
            } else {
                const presetFile = await dataFolder.createFile(presetFileName)
                const initialContent = {presets: []}
                presetFile.write(JSON.stringify(initialContent))
                return initialContent
            }
        } catch (e) {
            alert("Function load preset")
            alert(e)
        }
    }

    const doesFileExits = async (fileName) => {
        try {
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(fileName)
            return true
        } catch (e) {
            return false
        }
    }

    const savePreset = async () => {
        try {
            const inputVal = document.getElementById("template-input").value
            const newPresets = presets.concat(inputVal)
            setPresets(newPresets)
            console.log(newPresets)
            await writeToPresetFile(JSON.stringify({presets: newPresets}))
        } catch (e) {
            alert("Function save preset")
            alert(e)
        }
    }

    const writeToPresetFile = async (content) => {
        try {
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new preset')
        } catch (e) {
            alert("Function add to preset file")
            alert(e)
        }
    }

    const deletePreset = async (template) => {
        const filteredPresets = presets.filter((item) => {
            return item != template
        })
        setPresets(filteredPresets)
        console.log(filteredPresets)
        await writeToPresetFile(JSON.stringify({presets: filteredPresets}))
        // deselect all values as if there are only two values, it still keeps the deleted value as the selected visually despite it being not
        document.getElementById("saved-templates").value = ""
    }

    const loadPreset =  (template) => {
        if (template == undefined || template == null) {
            return
        }
        if (template.length < 1) {
            return
        }
        applyTemplate(template)
    }

    return <div id={"naming"}>
        {/*Heading*/}
        <Section sectionName={"Naming"} isTransparent={true}>
            <sp-heading size={"XXS"}>{shownName.length < 1 ? "FileName001" : shownName}</sp-heading>
            <sp-textfield class={"button-100"} id={"template-input"} placeholder={"Placeholder"}></sp-textfield>
            <sp-action-button class={"button-100"} onClick={() => {
                applyTemplate(document.getElementById("template-input").value)
            }}>Apply
            </sp-action-button>
            <sp-action-button class={"button-100 unimportant-button"} onClick={savePreset}>Save preset</sp-action-button>
            <sp-action-button class={"button-100 highlight-button"} onClick={openGuideDialog}>Guide</sp-action-button>
        </Section>

        <Section isTransparent={true} sectionName={"Presets"}>
            <div class={"heading-style"}>
                <div class={"fit-row-style"}>
                    <sp-dropdown class={"button-100"} placeholder={"Choose a selection..."}>
                        <sp-menu slot={"options"} id={"saved-templates"}>
                            {presets.map((item, index) => {
                                return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                            })}
                        </sp-menu>
                    </sp-dropdown>
                    <sp-action-button class={"width-50"} onClick={async () => await deletePreset(document.getElementById("saved-templates").value)}>Delete
                    </sp-action-button>
                    <sp-action-button class={"width-50 unimportant-button"} onClick={() => {
                        loadPreset(document.getElementById("saved-templates").value)
                    }}>Load
                    </sp-action-button>
                </div>
            </div>
        </Section>
    </div>
}