import React, {useRef, useState} from 'react';
import {Section} from "../../../components/section/Section";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useSelector} from "react-redux";
import {ProjectModal} from "../../../modals/project/ProjectModal";
import {useDispatch} from "react-redux";
import {logDecorator, syncLogDecorator} from "../../../utils/Logger";
import {core} from "photoshop";
import {storage} from 'uxp';
import {showAlert, entryExists, writeToFile} from "../../../utils/helper";
import {PATH_DELIMITER, PROJECT_FILE, STORAGE_FOLDER} from "../../../utils/constants";
import {useSetUp} from "../../../utils/presetManager";
import {spawnDialog} from "../../../utils/helper";
import {setSavedProjects} from "../../../redux/presetSlice";
import {setFiles} from "../../../redux/fileSystemSlice";
import {setIsStart} from "../../../redux/utilsSlice";
import {setCurrentIndex} from "../../../redux/pageSlice";

const fs = storage.localFileSystem;
export const SavedProjectsSection = () => {
    const dispatch = useDispatch()

    const presetSlice = useSelector(state => state.presets)
    const utilSlice = useSelector(state => state.utils)
    const fsSlice = useSelector(state => state.fileSystem)

    const isFocused = utilSlice.isFocused
    const savedProjects = presetSlice.savedProjects
    const loadedFiles = fsSlice.files

    const openProjectDialog = logDecorator(async function openProjectDialog() {
        if (loadedFiles.length < 1) {
            alert("No files are loaded!")
            return
        }
        await spawnDialog(<ProjectModal files={loadedFiles} saveProject={saveProject}/>, "Save Project Preset" )

    })

    const saveProject = logDecorator(async function saveProject(inputVal) {
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const newProject = {}
        newProject[inputVal] = loadedFiles
        const newProjects = {...savedProjects, ...newProject}
        dispatch(setSavedProjects(newProjects))
        const isSaved =  await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${STORAGE_FOLDER}${PATH_DELIMITER}${PROJECT_FILE}`, JSON.stringify(newProjects))
        if (isSaved)  {
            console.log("New project saved", newProject)
        } else {
            alert('Something went wrong and your project was not saved')
        }
    })

    const loadProject = syncLogDecorator(function loadProject(projectName) {
        if (!projectName) {
            return
        }
        const selectedProject = savedProjects[projectName]
        dispatch(setFiles(selectedProject))
        // reset everything in case other files were loaded before this
        dispatch(setIsStart(true))
        dispatch(setCurrentIndex(-1))

    })

    const removeProject = logDecorator(async function removeProject(inputVal) {
        if (!inputVal) {
            return
        }
        const newProjects = {}
        for (let i = 0; i < Object.keys(savedProjects).length; i++) {
            const key = Object.keys(savedProjects)[i]
            if (key !== inputVal) {
                newProjects[key] = savedProjects[key]
            }
        }
        dispatch(setSavedProjects(newProjects))

        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const isSaved =  await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${STORAGE_FOLDER}${PATH_DELIMITER}${PROJECT_FILE}`, JSON.stringify(newProjects))
        if (isSaved) {
            console.log("Removed project. Current projects: ", newProjects)
        } else {
            alert('Something went wrong and the project could not be deleted')
        }
        // do this to unselect anything in the dropdown menu
        document.getElementById("saved-projects").selectedIndex = -1

    })

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