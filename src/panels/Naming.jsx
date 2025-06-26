import React from 'react';
import "./Naming.css";
import "../components/CommonStyles.css";
import {useState, useEffect} from "react";
import {Section} from "../components/Section";
import {setTemplate} from "../reducers/templateSlice";
import {useDispatch, useSelector} from "react-redux";
import {createRoot} from "react-dom/client";
import {GuideModal} from "../modals/GuideModal";
import {clearLogs, logDecorator} from "../helpers/Logger";
import {addLeadingZeros, createDataFolderStruct, readFile, writeToFile} from "../helpers/helper";
import {ActionButton} from "../components/ActionButton";
import {storage} from 'uxp';
import {HighlightButton} from "../components/HighlightButton";
import {PRESET_FILE, STORAGE_FOLDER, PATH_DELIMITER} from "../helpers/constants";
import {setIsSetUp} from "../reducers/helperSlice";
import {useSetUp} from "../helpers/presetManager";

const fs = storage.localFileSystem;
export const Naming = () => {
    useSetUp()
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1
    // state vars
    const [shownName, setShownName] = useState("")
    const [presets, setPresets] = useState([])
    const [isPanelFocused, setIsPanelFocused] = useState(true)
    // other helpful vars
    const dispatch = useDispatch()
    let guideDialog = null;
    const presetFile = `${STORAGE_FOLDER}${PATH_DELIMITER}${PRESET_FILE}`
    // selectors
    const isFocus = useSelector(state => state.helperSlice.isFocused)
    const isSetUp = useSelector(state => state.helperSlice.isSetUp)
    const savedPresets = useSelector(state => state.presetSlice.presets)

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    useEffect(() => {
        console.log("Saved presets: ", savedPresets)
        setPresets(savedPresets)
    }, [savedPresets])

    // useEffect( () => {
    //     // load the preset file saved before starting anything
    //     const effectPresetContents = async () => {
    //         const presetContents = await loadPresets()
    //         console.log("loaded presets", presetContents)
    //         setPresets(presetContents)
    //     }
    //     if (isSetUp) {
    //         effectPresetContents().then()
    //         // Clears the log folder so it only contains the last 4/5 days of logs
    //         clearLogs().then()
    //     }
    // }, [isSetUp])

    // useEffect(() => {
    //     // Creates the data folder structure along with all the necessary files. Then it lets the other code know to run normal set up functions
    //     createDataFolderStruct().then(() => {
    //         dispatch(setIsSetUp(true))
    //     })
    // }, [])


    const applyTemplate = logDecorator(function applyTemplate(inputName)  {
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

        console.log('Applying pattern', inputName)
        setShownName(leadingZerosAppend)
        dispatch(setTemplate(inputName)) // sets to global variable

    })

    const openGuideDialog = logDecorator(async function openGuideDialog()  {
        // WTF is this even. There has to be a better way of doing this but I am too lazy to look for the information
        if (!guideDialog) {
            guideDialog = document.createElement("dialog")
            guideDialog.style.padding = "1rem"

            const root = createRoot(guideDialog)
            root.render(<GuideModal dialog={guideDialog}/>)
        }
        document.body.appendChild(guideDialog)

        guideDialog.onclose = () => {
            guideDialog.remove()
            guideDialog = null
        }

        await guideDialog.uxpShowModal({
            title: "Template guide",
        })

    })

    const loadPresets = logDecorator(async function loadPresets() {
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const presetContents = await readFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`)
        return JSON.parse(presetContents).presets
    })


    const savePreset = logDecorator(async function savePreset()  {
        const inputVal = document.getElementById("template-input").value
        if (inputVal.length < 1) {
            alert("No preset was inputted")
            return
        }
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const newPresets = presets.concat(inputVal)
        setPresets(newPresets)
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`,JSON.stringify({presets: newPresets}))
    })

    const deletePreset = logDecorator(async function deletePreset(template)  {
        const filteredPresets = presets.filter((item) => {
            return item !== template
        })
        setPresets(filteredPresets)
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`,JSON.stringify({presets: filteredPresets}))
        // deselect all values as if there are only two values, it still keeps the deleted value as the selected visually despite it being not
        document.getElementById("saved-templates").selectedIndex = -1

    })

    const applyPreset =  logDecorator(function applyPreset(template)  {
        if (template === undefined || template == null) {
            return
        }
        if (template.length < 1) {
            return
        }
        applyTemplate(template).then()

    })


    return <div id={"naming"}>
        {/*Heading*/}
        <Section sectionName={"Naming"} isTransparent={true}>
            <sp-heading size={"XXS"}>{shownName.length < 1 ? "FileName001" : shownName}</sp-heading>
            <sp-textfield class={"button-100"} id={"template-input"} placeholder={"Placeholder"}></sp-textfield>
            <ActionButton classHandle={"button-100"} clickHandler={() => {
                applyTemplate(document.getElementById("template-input").value).then()
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
                        applyPreset(document.getElementById("saved-templates").value).then()
                    }} isDisabled={!isPanelFocused}>Load
                    </HighlightButton>
                </div>
            </div>
        </Section>
    </div>
}