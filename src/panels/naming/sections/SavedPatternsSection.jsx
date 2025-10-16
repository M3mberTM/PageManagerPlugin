import React from "react";
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useDispatch, useSelector} from "react-redux";
import {logDecorator, syncLogDecorator} from "../../../utils/Logger";
import {writeToPresetFile} from "../../../utils/helper";
import {setSavedNamingPatterns} from "../../../redux/presetSlice";

export const SavedPatternsSection = ({setTemplate, applyTemplate}) => {

    const dispatch = useDispatch()
    const presetSlicer = useSelector((state) => state.presets)
    const utilSlicer = useSelector((state) => state.utils)

    const isFocused = utilSlicer.isFocused
    const savedNamingPatterns = presetSlicer.savedNamingPatterns

    const selectPattern =  syncLogDecorator(function selectPattern(template)  {
        if (template === undefined || template == null) {
            return
        }
        if (template.length < 1) {
            return
        }
        applyTemplate(template)
        setTemplate(template)
        document.getElementById('template-input').value = template
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

    // noinspection HtmlUnknownAttribute
    return (
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
    )
}