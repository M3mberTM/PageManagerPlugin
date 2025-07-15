import React from "react";
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useSelector} from "react-redux";

export const SavedProjectsSection = () => {

    const presetSlice = useSelector(state => state.presets)
    const utilSlice = useSelector(state => state.utils)

    const isFocused = utilSlice.isFocused
    const savedProjects = presetSlice.savedProjects

    return (
        <Section isTransparent={true} sectionName={"project"}>
            <sp-picker class={"button-100"} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} id={"saved-projects"}>
                    {Object.keys(savedProjects).map((item, index) => {
                        return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                    })}
                </sp-menu>
            </sp-picker>
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "50%"}} clickHandler={() => {
                    removeProject(document.getElementById("saved-projects").value).then()
                }} isDisabled={!isFocused}>Remove
                </ActionButton>
                <ActionButton style={{width: "50%"}} clickHandler={() => loadProject(document.getElementById("saved-projects").value)}
                              isDisabled={!isFocused}>Load</ActionButton>
            </div>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                openProjectDialog().then()
            }} isDisabled={!isFocused}>Save
            </HighlightButton>
        </Section>
    )
}