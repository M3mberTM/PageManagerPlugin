import React, {useRef, useState} from 'react';
import "./Movement.css";
import "../../CommonStyles.css";
import {useSelector} from "react-redux";
import {createRoot} from "react-dom";
import {OverwriteModal} from "../../modals/overwrite/OverwriteModal";
import {ProjectModal} from "../../modals/project/ProjectModal";
import {useDispatch} from "react-redux";
import {logDecorator, syncLogDecorator} from "../../utils/Logger";
import {core} from "photoshop";
import {storage} from 'uxp';
import {showAlert, entryExists, writeToFile} from "../../utils/helper";
import {PATH_DELIMITER} from "../../utils/constants";
import {useSetUp} from "../../utils/presetManager";
import {setIsStart} from "../../redux/utilsSlice";
import {FileSection} from "./sections/FileSection";
import {SavedProjectsSection} from "./sections/SavedProjectsSection";
import {InformationSection} from "./sections/InformationSection";

const fs = storage.localFileSystem;

export const MovementPanel = () => {
    useSetUp()
    const completedFilesNum = useRef(0)
    const currentPageIndex = useRef(-1)
    // helper refs
    const isLoadingFile = useRef(false)
    const scrollRef = useRef()
    const currentDoc = useRef(undefined)
    const previousDoc = useRef(undefined)
    // selectors
    const dispatch = useDispatch()
    const fsSlice = useSelector(state => state.fileSystem)
    const utilSlice = useSelector(state => state.utils)
    const presetSlice = useSelector(state => state.presets)
    const namingSlice = useSelector(state => state.naming)

    const isFocused = utilSlice.isFocused
    const isStart = utilSlice.isStart
    const loadedFiles = fsSlice.files
    const savedProjects = presetSlice.savedProjects
    const namingPattern = namingSlice.namingPattern

    // Rerender variable
    const [rerender, setRerender] = useState(false)

    const elementScrollToView = syncLogDecorator(function elementScrollToView() {
        scrollRef.current.scrollIntoView({behavior: 'smooth'})
    })

    const rerenderPanel = syncLogDecorator(function rerenderPanel() {
        setRerender(!rerender)
    })


    const goToFile = logDecorator(async function goToFile(pageIndex) {
        // if the person is stupid enough to double click the file he is on, this will prevent it
        if (pageIndex === currentPageIndex.current) {
            return
        }
        // Changes state of the Photoshop application, executeAsModal has to be used
        await openFile(pageIndex)
        await closeFile(previousDoc.current)

        currentPageIndex.current = pageIndex
        if (isStart) {
            dispatch(setIsStart(false))
        }
        rerenderPanel()
        console.log('Rerendered!')
    })

    const openFile = logDecorator(async function openFile(pageIndex) {
        if (!isLoadingFile.current) {
            let fileEntry
            console.log('opening entry: ', loadedFiles[pageIndex])
            if (loadedFiles[pageIndex].exportPath.length > 1) {
                fileEntry = await fs.getEntryWithUrl(loadedFiles[pageIndex].exportPath)
            } else {
                fileEntry = await fs.getEntryWithUrl(loadedFiles[pageIndex].filePath)
            }
            previousDoc.current = currentDoc.current
            currentDoc.current = await openDocument(fileEntry)

            currentPageIndex.current = pageIndex
            console.log("Opened document: ", currentDoc.current)
        }
    })

    const openDocument = logDecorator(async function openDocument(entry) {
        const app = window.require("photoshop").app
        let document
        isLoadingFile.current = true
        await core.executeAsModal(async () => document = await app.open(entry))
        isLoadingFile.current = false
        return document
    })

    const closeDocument = logDecorator(async function closeDocument(document){
        await core.executeAsModal(async () => await document.close())
    })

    const closeFile = logDecorator(async function closeFile(document) {
        if (!isLoadingFile.current) {
            if (!document) {
                console.log('No previous document to close!')
                return
            }
            await closeDocument(document)
            console.log("Closed document ", document)
        }
    })

    const getPageName = syncLogDecorator(function getPageName(currentPage) {
        if (!currentPage) {
            return 'Page name'
        }
        // if there is no template, just use the normal page name
        if (namingPattern.length < 1) {
            return currentPage.name.replace(/\.[\w\d]+$/, "")
        }
        // if there is template, replace each specific pattern for it's part
        const originalNameAppend = namingPattern.replaceAll("%og%", currentPage.name)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(currentPage.pageNumber))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = addLeadingZeros(currentPage.pageNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        return leadingZerosAppend.replace(/\.[\w\d]+$/, "")

    })

    const openStartingFile = logDecorator(async function openStartingFile() {
        if (loadedFiles.length > 0) {
            await openFile(0)
            dispatch(setIsStart(false))
            rerenderPanel()
        } else {
            alert("No files were loaded")
        }

    })
    // todo redo functionality underneath this

    const openNextFile = logDecorator(async function openNextFile(pageNum) {
        // current function changes the state in photoshop, therefore it is called using executeAsModal
        await core.executeAsModal(() => openFile(pageNum))

    })


    const goToNextFile = logDecorator(async function goToNextFile(isForward) {
        if (!isLoadingFile.current) {
            isLoadingFile.current = true

            if (isStart) {
                setIsStart(false)
            }
            const current = currentPageIndex
            const currentPageNum = projectFiles[currentPageIndex].pageNumber
            const filesLength = projectFiles.length
            if (isForward) {
                if (current !== filesLength - 1) {
                    setCurrentPageIndex(current + 1)
                    setPageNumber(currentPageNum + 1)
                    await openNextFile(current + 1)
                    const pageName = await getPageName(projectFiles[current + 1])
                    setCurrentPageName(pageName)
                    // Photoshop application state changed, so executeAsModal is used
                    await core.executeAsModal(() => closeFile(previousDoc.current))
                } else {
                    alert("Congratulation, you are done!")
                }
            } else {
                if (current !== 0) {
                    setCurrentPageIndex(current - 1)
                    setPageNumber(currentPageNum - 1)
                    await openNextFile(current - 1)
                    const pageName = await getPageName(projectFiles[current - 1])
                    setCurrentPageName(pageName)
                    // Photoshop application state changed, so executeAsModal is used
                    await core.executeAsModal(() => closeFile(previousDoc.current))
                }
            }
            elementScrollToView().then()

            isLoadingFile.current = false
        }
    })


    // Changes the file status to complete if not completed and vice versa
    const changeFileStatus = syncLogDecorator(function changeFileStatus(index) {

        const file = projectFiles[index]
        const newFile = {...file, isDone: !file.isDone}
        const newFiles = projectFiles.map((file) => {
            if (file.id === newFile.id) {
                return newFile
            } else {
                return file
            }
        })
        setProjectFiles(newFiles)

        if (newFile.isDone) {
            setCompletedNum(completedNum + 1)
        } else {
            setCompletedNum(completedNum - 1)
        }

    })


    const addLeadingZeros = syncLogDecorator(function addLeadingZeros(num, size) {
        return String(num).padStart(size, '0')
    })


    const saveFile = logDecorator(async function saveFile(pageName) {
        const exportFolder = await fs.getEntryWithUrl(directories.exportDir)
        const saveName = `${pageName}.psd`
        const entry = await exportFolder.createFile(saveName, {overwrite: true})
        const isSaved = await require('photoshop').core.executeAsModal(() => savePSD(entry))
        if (isSaved) {
            console.log("File was successfully saved", entry)
            /* TODO rewrite either this function to not use currentPageIndex or redo all state variables differently
            (currentPageIndex) doesn't get updated quickly enough to save the export path to the correct page
             */
            const ogPage = projectFiles[currentPageIndex]
            const updatedPage = {...ogPage, exportPath: `${directories.exportDir}${PATH_DELIMITER}${saveName}`}
            const newFiles = projectFiles.map((item) => {
                if (item.id === updatedPage.id) {
                    return updatedPage
                } else {
                    return item
                }
            })
            setProjectFiles(newFiles)
            return true
        } else {
            alert("Something went wrong and we couldn't save your file!")
            return false
        }

    })


    const overwriteCheck = logDecorator(async function overwriteCheck(pageName) {
        if (directories.exportDir.length < 1) {
            alert("No export directory is chosen")
            return
        }

        if (!directories.shouldExport) {
            alert("Enable export")
            return
        }

        const currentFile = `${directories.exportDir}${PATH_DELIMITER}${pageName}.psd`
        if (await entryExists(currentFile)) {
            await openOverwriteDialog(pageName)
        } else {
            await saveFile(pageName)
        }

    })
    const overwriteFile = logDecorator(async function overwriteFile(pageName) {
        overwriteAlert.close()
        await saveFile(pageName)

    })

    // if file is about to be overwritten, show overwrite dialog because uxp doesn't support overwrite dialog by default
    const openOverwriteDialog = logDecorator(async function openOverwriteDialog(pageName) {
        if (!overwriteAlert) {
            overwriteAlert = document.createElement("dialog")
            overwriteAlert.style.padding = "1rem"
            // creates element in the root to server as a dialog
            const root = createRoot(overwriteAlert)
            root.render(<OverwriteModal dialog={overwriteAlert} fileToOverwriteName={pageName}
                                        overwriteFile={overwriteFile}/>)
        }
        document.body.appendChild(overwriteAlert)

        overwriteAlert.onclose = () => {
            overwriteAlert.remove()
            overwriteAlert = null
        }

        await overwriteAlert.uxpShowModal({
            title: "Overwrite alert",
        })

    })


    const openProjectDialog = logDecorator(async function openProjectDialog() {
        if (projectFiles.length < 1) {
            alert("No files are loaded!")
            return
        }

        if (!projectDialog) {
            projectDialog = document.createElement("dialog")
            projectDialog.style.padding = "1rem"

            // creates element in the root to server as a dialog
            const root = createRoot(projectDialog)
            root.render(<ProjectModal dialog={projectDialog} files={projectFiles} saveProject={saveProject}/>)
        }
        document.body.appendChild(projectDialog)

        projectDialog.onclose = () => {
            projectDialog.remove()
            projectDialog = null
        }

        await projectDialog.uxpShowModal({
            title: "Save Project Preset",
        })

    })

    const savePSD = logDecorator(async function savePSD(entry) {
        try {
            currentDoc.current.saveAs.psd(entry)
            return true
        } catch (e) {
            showAlert("Function savePSD")
            showAlert(e)
            return false
        }
    })

    const removeProject = logDecorator(async function removeProject(inputVal) {
        if (!inputVal) {
            return
        }
        const newProjects = {}
        for (let i = 0; i < Object.keys(projects).length; i++) {
            const key = Object.keys(projects)[i]
            if (key !== inputVal) {
                newProjects[key] = projects[key]
            }
        }
        setProjects(newProjects)
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`, JSON.stringify(newProjects))
        console.log("Removed project. Current projects: ", newProjects)
        // do this to unselect anything in the dropdown menu
        document.getElementById("saved-projects").selectedIndex = -1

    })

    const saveProject = logDecorator(async function saveProject(inputVal) {
        projectDialog.close()
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const newProject = {}
        newProject[inputVal] = projectFiles
        const newProjects = {...projects, ...newProject}

        setProjects(newProjects)
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`, JSON.stringify(newProjects))
        console.log("New project saved", newProject)

    })

    const loadProject = logDecorator(async function loadProject(projectName) {
        if (!projectName) {
            return
        }
        const selectedProject = projects[projectName]
        setProjectFiles(selectedProject)
        dispatch(setFiles(selectedProject))

    })


    return <div id={"export"}>
        <FileSection getPageName={getPageName}/>
        <InformationSection getPageName={getPageName}/>
        <SavedProjectsSection/>
    </div>
}