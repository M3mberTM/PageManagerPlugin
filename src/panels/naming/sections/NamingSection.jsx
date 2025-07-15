import React from "react";
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useDispatch, useSelector} from "react-redux";
import {logDecorator} from "../../../utils/Logger";
import {spawnDialog, writeToPresetFile} from "../../../utils/helper";
import {saveNamingPattern} from "../../../redux/presetSlice";
import {GuideModal} from "../../../modals/guide/GuideModal";

export const NamingSection = ({exampleFilename,applyTemplate, setTemplate}) => {

    const dispatch = useDispatch()
    const namingSlicer = useSelector((state) => state.naming)
    const presetSlicer = useSelector((state) => state.presets)
    const utilSlicer = useSelector((state) => state.utils)

    const namingPattern = namingSlicer.namingPattern
    const savedNamingPatterns = presetSlicer.savedNamingPatterns
    const isFocused = utilSlicer.isFocused

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

    const shownName = namingPattern.length < 1 ? exampleFilename : applyTemplate(namingPattern)
    return (
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
    )
}