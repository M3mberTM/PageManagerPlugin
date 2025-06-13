import React from 'react';
import "./Naming.css";
import "../components/CommonStyles.css";
import {useState, useEffect} from "react";
import {Section} from "../components/Section";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch, useSelector} from "react-redux";
import {createRoot} from "react-dom/client";
import {GuideModal} from "../components/GuideModal";
import {logDecorator} from "../helpers/Logger";
import {createDataFolderStruct, showAlert} from "../helpers/helper";
import {ActionButton} from "../components/ActionButton";
import {storage} from 'uxp';
import {HighlightButton} from "../components/HighlightButton";

const fs = storage.localFileSystem;
// todo remove all try and catch
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
    // selectors
    const isFocus = useSelector(state => state.focusSlice.value)

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    useEffect( () => {
        // load the preset file saved before starting anything
        const effectPresetContents = async () => {
            const presetContents = await getPresetFileContents()
            console.log("loaded presets", presetContents.presets)
            setPresets(presetContents.presets)
        }
        effectPresetContents().then()
        createDataFolderStruct().then()
    }, [])

    const addLeadingZeros = logDecorator(async function addLeadingZeros(num, size)  {
        try {
            num = num.toString();
            while (num.length < size) num = "0" + num;
            return num;
        } catch (e) {
            showAlert("Function add leading zeros")
            showAlert(e)
        }
    })

    const applyTemplate = logDecorator(async function applyTemplate(inputName)  {
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
                const paddedNum = await addLeadingZeros(exampleFileNumber, padLength)
                leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
            }

            setShownName(leadingZerosAppend)
            dispatch(setTemplate(inputName)) // sets to global variable
        } catch (e) {
            showAlert("Function handle Input change")
            showAlert(e)
        }
    })

    const closeGuideDialog = logDecorator(async function closeGuideDialog()  {
        try {
            guideDialog.close()
        } catch (e) {
            showAlert("Function close guide dialog")
            showAlert(e)
        }
    })

    const openGuideDialog = logDecorator(async function openGuideDialog()  {
        try {
            // WTF is this even. There has to be a better way of doing this but I am too lazy to look for the information
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
            showAlert("Function open guide dialog")
            showAlert(e)
        }
    })

    const getPresetFileContents = logDecorator(async function getPresetFileContents()  {
        try {
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
            showAlert("Function load preset")
            showAlert(e)
        }
    })

    const doesPresetFileExist = logDecorator(async function doesPresetFileExist(fileName)  {
        try {
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(fileName)
            return true
        } catch (e) {
            return false
        }
    })

    const savePreset = logDecorator(async function savePreset()  {
        try {
            const inputVal = document.getElementById("template-input").value
            if (inputVal.length < 1) {
                alert("No preset was inputted")
                return
            }
            const newPresets = presets.concat(inputVal)
            setPresets(newPresets)
            await writeToPresetFile(JSON.stringify({presets: newPresets}))
        } catch (e) {
            showAlert("Function save preset")
            showAlert(e)
        }
    })

    const writeToPresetFile = logDecorator(async function writeToPresetFile(content)  {
        try {
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new preset')
        } catch (e) {
            showAlert("Function add to preset file")
            showAlert(e)
        }
    })

    const deletePreset = logDecorator(async function deletePreset(template)  {
        try {
            const filteredPresets = presets.filter((item) => {
                return item != template
            })
            setPresets(filteredPresets)
            await writeToPresetFile(JSON.stringify({presets: filteredPresets}))
            // deselect all values as if there are only two values, it still keeps the deleted value as the selected visually despite it being not
            document.getElementById("saved-templates").selectedIndex = -1
        } catch(e) {
            showAlert("Function deletePreset")
            showAlert(e)
        }
    })

    const loadPreset =  logDecorator(async function loadPreset(template)  {
        try {
            if (template == undefined || template == null) {
                return
            }
            if (template.length < 1) {
                return
            }
            await applyTemplate(template)
        } catch (e) {
            showAlert("Function loadPreset")
            showAlert(e)
        }
    })


    return <div id={"naming"}>
        {/*Heading*/}
        <Section sectionName={"Naming"} isTransparent={true}>
            <sp-heading size={"XXS"}>{shownName.length < 1 ? "FileName001" : shownName}</sp-heading>
            <sp-textfield class={"button-100"} id={"template-input"} placeholder={"Placeholder"}></sp-textfield>
            <ActionButton classHandle={"button-100"} clickHandler={() => {
                applyTemplate(document.getElementById("template-input").value)
            }} isDisabled={!isPanelFocused}>Apply
            </ActionButton>
            <ActionButton classHandle={"button-100"} clickHandler={savePreset} isDisabled={!isPanelFocused}>Save preset</ActionButton>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={openGuideDialog} isDisabled={!isPanelFocused}>Guide</HighlightButton>
        </Section>

        <Section isTransparent={true} sectionName={"Presets"}>
            <div class={"heading-style"}>
                <div class={"fit-row-style"}>
                    <sp-picker class={"button-100"} placeholder={"Choose a selection..."}>
                        <sp-menu slot={"options"} id={"saved-templates"}>
                            {presets.map((item, index) => {
                                return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                            })}
                        </sp-menu>
                    </sp-picker>
                    <ActionButton classHandle={"width-50"} clickHandler={async () => await deletePreset(document.getElementById("saved-templates").value)} isDisabled={!isPanelFocused}>Delete
                    </ActionButton>
                    <HighlightButton classHandle={"width-50 unimportant-button"} clickHandler={() => {
                        loadPreset(document.getElementById("saved-templates").value)
                    }} isDisabled={!isPanelFocused}>Load
                    </HighlightButton>
                </div>
            </div>
        </Section>
    </div>
}