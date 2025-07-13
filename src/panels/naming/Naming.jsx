import React from 'react';
import "./Naming.css";
import "../../CommonStyles.css";
import {Section} from "../../components/section/Section";
import {useDispatch, useSelector} from "react-redux";
import {createRoot} from "react-dom/client";
import {GuideModal} from "../../modals/guide/GuideModal";
import {logDecorator, syncLogDecorator} from "../../utils/Logger";
import {addLeadingZeros, readFile, spawnDialog, writeToFile, writeToPresetFile} from "../../utils/helper";
import {ActionButton} from "../../components/actionButton/ActionButton";
import {storage} from 'uxp';
import {HighlightButton} from "../../components/highlightButton/HighlightButton";
import {PRESET_FILE, STORAGE_FOLDER, PATH_DELIMITER} from "../../utils/constants";
import {useSetUp} from "../../utils/presetManager";
import {setNamingPattern} from "../../redux/namingSlice";
import {saveNamingPattern, setSavedNamingPatterns} from "../../redux/presetSlice";

const fs = storage.localFileSystem;
export const Naming = () => {
    useSetUp()
    const exampleFilename = "FileName001"
    const exampleFileNumber = 1

    const dispatch = useDispatch()
    const presetSlicer = useSelector((state) => state.presets)
    const utilSlicer = useSelector((state) => state.utils)
    const namingSlicer = useSelector((state) => state.naming)

    const isFocused = utilSlicer.isFocused
    const savedNamingPatterns = presetSlicer.savedNamingPatterns
    const namingPattern = namingSlicer.namingPattern

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

    const savePattern = logDecorator(async function savePattern(pattern)  {
        if (pattern.length < 1) {
            alert("No pattern was inputted")
            return
        }
        const newPatterns = savedNamingPatterns.concat(pattern)
        const isPatternSaved = await writeToPresetFile(newPatterns)
        if (isPatternSaved) {
            dispatch(saveNamingPattern(pattern))
        }
    })

    const openGuideDialog = logDecorator(async function openGuideDialog()  {
        await spawnDialog(<GuideModal/>, 'Template Guide')
    })

    const deletePreset = logDecorator(async function deletePreset(template)  {
        if (!template) {
            alert('No pattern was selected')
            return
        }
        const filteredPatterns = savedNamingPatterns.filter((item) => {
            return item !== template
        })
        const isPatternDeleted = await writeToPresetFile(filteredPatterns)
        if (isPatternDeleted) {
            console.log('Deleted pattern: ', template)
            dispatch(setSavedNamingPatterns(filteredPatterns))
        }
        // deselect all values as if there are only two values, it still keeps the deleted value as the selected visually despite it being not
        document.getElementById("saved-templates").selectedIndex = -1
    })

    const selectPattern =  syncLogDecorator(function selectPattern(template)  {
        if (template === undefined || template == null) {
            return
        }
        if (template.length < 1) {
            return
        }
        setTemplate(applyTemplate(template))
    })

    const shownName = namingPattern.length < 1 ? exampleFilename : applyTemplate(namingPattern)
    return <div id={"naming"}>
        <Section sectionName={"Naming"} isTransparent={true}>
            <sp-heading size={"XXS"}>{shownName}</sp-heading>
            <sp-textfield class={"button-100"} id={"template-input"} placeholder={"Placeholder"}></sp-textfield>
            <ActionButton classHandle={"button-100"} clickHandler={() => {
                setTemplate(document.getElementById('template-input').value)
            }} isDisabled={!isFocused}>Apply
            </ActionButton>
            <ActionButton classHandle={"button-100"} clickHandler={() => savePattern(document.getElementById('template-input').value)} isDisabled={!isFocused}>Save preset</ActionButton>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={openGuideDialog} isDisabled={!isFocused}>Guide</HighlightButton>
        </Section>

        <Section isTransparent={true} sectionName={"Presets"}>
            <div class={"heading-style"}>
                <div class={"fit-row-style"}>
                    <sp-picker class={"button-100"} placeholder={"Choose a selection..."}>
                        <sp-menu slot={"options"} id={"saved-templates"}>
                            {savedNamingPatterns.map((item, index) => {
                                return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                            })}
                        </sp-menu>
                    </sp-picker>
                    <ActionButton classHandle={"width-50"} clickHandler={() => deletePreset(document.getElementById("saved-templates").value)} isDisabled={!isFocused}>Delete
                    </ActionButton>
                    <HighlightButton classHandle={"width-50 unimportant-button"} clickHandler={() => {
                        selectPattern(document.getElementById("saved-templates").value)
                    }} isDisabled={!isFocused}>Load
                    </HighlightButton>
                </div>
            </div>
        </Section>
    </div>
}