import React from 'react';
import "./Naming.css";
import "../components/CommonStyles.css";
import {useState, useEffect} from "react";
import {Section} from "../components/Section";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch, useSelector} from "react-redux";
import {createRoot} from "react-dom";
import {GuideModal} from "../components/GuideModal";
import {clearLog, logToFile} from "../components/Logger";

const fs = require('uxp').storage.localFileSystem;

export const Naming = () => {
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1
    // state vars
    const [shownName, setShownName] = useState("")
    const [presets, setPresets] = useState([])
    const [isPanelFocused, setIsPanelFocused] = useState(true)
    // other helpful vars
    const dispatch = useDispatch()
    let guideDialog = null;
    const presetFileName = 'presets.txt'

    const isFocus = useSelector(state => state.focusSlice.value)

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    useEffect( () => {
        // load the preset file saved before starting anything
        const effectPresetContents = async () => {
            const presetContents = await getPresetFileContents()
            await clearLog()
            console.log(presetContents.presets)
            setPresets(presetContents.presets)
        }
        effectPresetContents().then(r => console.log("Loaded the presets"))
    }, [])

    const addLeadingZeros = async (num, size) => {
        try {
            await logToFile(`addLeadingZeros(${num},${size})`, false)
            num = num.toString();
            while (num.length < size) num = "0" + num;
            return num;
        } catch (e) {
            await logToFile(`addLeadingZeros(${num},${size});${e}`, true)
            alert("Function add leading zeros")
            alert(e)
        }
    }

    const applyTemplate = async (inputName) => {
        try {
            await logToFile(`applyTemplate(${inputName})`, false)
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
                const paddedNum = await addLeadingZeros(exampleFileNumber, padLength)
                leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
            }

            setShownName(leadingZerosAppend)
            dispatch(setTemplate(inputName)) // sets to global variable
        } catch (e) {
            await logToFile(`applyTemplate(${inputName});${e}`, true)
            alert("Function handle Input change")
            alert(e)
        }
    }

    const closeGuideDialog = async () => {
        try {
            await logToFile(`closeGuideDialog()`, false)
            guideDialog.close()
        } catch (e) {
            await logToFile(`closeGuideDialog();${e}`, true)
            alert("Function close guide dialog")
            alert(e)
        }
    }

    const openGuideDialog = async () => {
        try {
            await logToFile(`openGuideDialog()`, false)
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
            await logToFile(`openGuideDialog();${e}`, true)
            alert("Function open guide dialog")
            alert(e)
        }
    }

    const getPresetFileContents = async () => {
        try {
            await logToFile(`getPresetFileContents()`, false)
            const dataFolder = await fs.getDataFolder()
            if (await doesPresetFileExist(presetFileName)) {
                const presetFile = await dataFolder.getEntry(presetFileName)
                const fileContent = await presetFile.read()
                return JSON.parse(fileContent)
            } else {
                const presetFile = await dataFolder.createFile(presetFileName)
                const initialContent = {presets: []}
                presetFile.write(JSON.stringify(initialContent))
                return initialContent
            }
        } catch (e) {
            await logToFile(`getPresetFileContents();${e}`, true)
            alert("Function load preset")
            alert(e)
        }
    }

    const doesPresetFileExist = async (fileName) => {
        try {
            await logToFile(`doesFileExists(${fileName})`, false)
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(fileName)
            return true
        } catch (e) {
            return false
        }
    }

    const savePreset = async () => {
        try {
            await logToFile(`savePreset()`, false)
            const inputVal = document.getElementById("template-input").value
            if (inputVal.length < 1) {
                alert("No preset was inputted")
                return
            }
            const newPresets = presets.concat(inputVal)
            setPresets(newPresets)
            await writeToPresetFile(JSON.stringify({presets: newPresets}))
        } catch (e) {
            await logToFile(`savePreset();${e}`, true)
            alert("Function save preset")
            alert(e)
        }
    }

    const writeToPresetFile = async (content) => {
        try {
            await logToFile(`writeToPresetFile(${content})`, false)
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new preset')
        } catch (e) {
            await logToFile(`writeToPresetFile(${content});${e}`, true)
            alert("Function add to preset file")
            alert(e)
        }
    }

    const deletePreset = async (template) => {
        try {
            await logToFile(`deletePreset(${template})`, false)
            const filteredPresets = presets.filter((item) => {
                return item != template
            })
            setPresets(filteredPresets)
            await writeToPresetFile(JSON.stringify({presets: filteredPresets}))
            // deselect all values as if there are only two values, it still keeps the deleted value as the selected visually despite it being not
            document.getElementById("saved-templates").selectedIndex = -1
        } catch(e) {
            await logToFile(`deletePreset(${template});${e}`, true)
            alert("Function deletePreset")
            alert(e)
        }
    }

    const loadPreset =  async (template) => {
        try {
            await logToFile(`loadPreset(${template})`, false)
            if (template == undefined || template == null) {
                return
            }
            if (template.length < 1) {
                return
            }
            await applyTemplate(template)
        } catch (e) {
            await logToFile(`loadPreset(${template});${e}`, true)
            alert("Function loadPreset")
            alert(e)
        }
    }

    if (!isPanelFocused) {
        return <div id={"naming"}>

        </div>
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
            <sp-action-button class={"button-100"} onClick={savePreset}>Save preset</sp-action-button>
            <sp-action-button class={"button-100 unimportant-button"} onClick={openGuideDialog}>Guide</sp-action-button>
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