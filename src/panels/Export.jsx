import React, {useEffect, useRef} from 'react';
import {Section} from "../components/Section";
import {useState} from "react";
import "./Export.css";
import "../components/CommonStyles.css";
import {FileObject} from "../components/FileObject";
import {useSelector} from "react-redux";
import {createRoot} from "react-dom";
import {OverwriteModal} from "../components/OverwriteModal";
import {ProjectModal} from "../components/ProjectModal";
import {useDispatch} from "react-redux";
import {setFiles} from "../reducers/fileSlice";
import {logDecorator, logToFile} from "../helpers/Logger";
import {app} from "photoshop";
import {core} from "photoshop";
import {storage} from 'uxp';
import {showAlert, entryExists} from "../helpers/helper";
import {ActionButton} from "../components/ActionButton";
import {HighlightButton} from "../components/HighlightButton";

const fs = storage.localFileSystem;

export const Export = () => {
    // states
    const [files, setProjectFiles] = useState([])
    const [directories, setDirectories] = useState({})
    const [isPanelFocused, setIsPanelFocused] = useState(false)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [completedNum, setCompletedNum] = useState(0)
    const [pageNumber, setPageNumber] = useState(0)
    const [isStart, setIsStart] = useState(true)
    const [currentPageName, setCurrentPageName] = useState("")
    const [presets, setPresets] = useState([])
    const [projects, setProjects] = useState({})
    // other variables
    let overwriteAlert = null
    let projectDialog = null
    const isLoadingFile = useRef(false)
    const presetFileName = 'projects.txt'
    const dispatch = useDispatch()
    const scrollRef = useRef()
    // selectors
    const dirFiles = useSelector(state => state.fileSlice.value)
    const namingTemplate = useSelector((state) => state.templateSlice.value)
    const dirs = useSelector((state) => state.folderSlice.value)
    const isFocus = useSelector(state => state.focusSlice.value)

    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    // updates the files shown each time they are changed in the other panels
    useEffect(() => {
        const loadedFiles = [...dirFiles]
        // sorts the files in the same way as the file explorer does
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        const sortedFiles = loadedFiles.sort((a, b) => collator.compare(a.name, b.name))
        setProjectFiles(sortedFiles)
        setCurrentPageIndex(0)
        setPageNumber(0)
        setIsStart(true)
        setCompletedNum(0)
    }, [dirFiles])

    // Updates the page name each time it is changed in the Naming panel
    useEffect(() => {
        const effectPageName = async () => {
            if (files.length > 0) {
                await getPageName(files[currentPageIndex])
            }
        }
        effectPageName().then()
    }, [namingTemplate])

    // Updates the saved projects list
    useEffect(() => {
        const effectProjectContents = async () => {
            const projectContents = await getPresetFileContents()
            console.log("loaded saved projects", projectContents)
            setProjects(projectContents)
            setPresets(Object.keys(projectContents))
        }
        effectProjectContents().then()
    }, [])

    //Updates the import and export directories
    useEffect(() => {
        setDirectories(dirs)
        console.log("Import or Export updated. Reloaded import and export directories", dirs)
    }, [dirs])

    // automatically scrolls to the current file opened in the file list
    const elementScrollToView = logDecorator(function elementScrollToView()  {
        scrollRef.current.scrollIntoView({behavior: 'smooth'})
    })

    const openFile = logDecorator(async function openFile(pageIndex)  {
        const app = window.require("photoshop").app
        let fileEntry = null
        if (files[pageIndex].exportPath.length > 1) {
            console.log(files[pageIndex].exportPath)
            fileEntry = await fs.getEntryWithUrl(files[pageIndex].exportPath)
        } else {
            fileEntry = await fs.getEntryWithUrl(files[pageIndex].filename)
        }
        await app.open(fileEntry)
    })

    const openNextFile = logDecorator(async function openNextFile(pageNum)  {
        // current function changes the state in photoshop, therefore it is called using executeAsModal
        await core.executeAsModal(() => openFile(pageNum))

    })

    const goToFile = logDecorator(async function goToFile(pageIndex)  {

        const currentDoc = app.activeDocument
        setCurrentPageIndex(pageIndex)
        const newPageNum = files[pageIndex].pageNumber
        setPageNumber(newPageNum)
        // Changes state of the Photoshop application, executeAsModal has to be used
        await core.executeAsModal(() => openFile(pageIndex))
        await core.executeAsModal(() => closeFile(currentDoc))

    })

    const goToNextFile = logDecorator(async function goToNextFile(isForward)  {
        if (!isLoadingFile.current) {
            isLoadingFile.current = true

            if (isStart) {
                setIsStart(false)
            }
            const current = currentPageIndex
            const currentPageNum = files[currentPageIndex].pageNumber
            const filesLength = files.length
            const currentDoc = app.activeDocument
            if (isForward) {
                if (current != filesLength - 1) {
                    setCurrentPageIndex(current + 1)
                    setPageNumber(currentPageNum + 1)
                    await openNextFile(current + 1)
                    await getPageName(files[current + 1])
                    // Photoshop application state changed, so executeAsModal is used
                    await core.executeAsModal(() => closeFile(currentDoc))
                } else {
                    alert("Congratulation, you are done!")
                }
            } else {
                if (current != 0) {
                    setCurrentPageIndex(current - 1)
                    setPageNumber(currentPageNum - 1)
                    await openNextFile(current - 1)
                    await getPageName(files[current - 1])
                    // Photoshop application state changed, so executeAsModal is used
                    await core.executeAsModal(() => closeFile(currentDoc))
                }
            }
            elementScrollToView().then()

            isLoadingFile.current = false
        }
    })

    const closeFile = logDecorator(async function closeFile(document)  {
        await document.close()
    })

    // Changes the file status to complete if not completed and vice versa
    const changeFileStatus = logDecorator(function changeFileStatus(index)  {

        const file = files[index]
        const newFile = {...file, isDone: !file.isDone}
        const newFiles = files.map((file) => {
            if (file.id == newFile.id) {
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

    const openStartingFile = logDecorator(async function openStartingFile()  {
        if (files.length > 0) {
            await openNextFile(0)
            setIsStart(false)
            await getPageName(files[0])
        } else {
            alert("No files were loaded")
        }

    })

    const addLeadingZeros = logDecorator(function addLeadingZeros(num, size)  {

        return String(num).padStart(size, '0')

    })

    // gets the page name according to the template given in Naming panel
    const getPageName = logDecorator(function getPageName(currentPage)  {

        if (namingTemplate.length < 1) {
            const finalName = currentPage.name.replace(/\.[\w\d]+$/, "")
            setCurrentPageName(finalName)
            return
        }
        const originalNameAppend = namingTemplate.replaceAll("%og%", currentPage.name)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(currentPage.pageNumber))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = addLeadingZeros(currentPage.pageNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        const finalName = leadingZerosAppend.replace(/\.[\w\d]+$/, "")

        setCurrentPageName(finalName)

    })

    const saveFile = logDecorator(async function saveFile()  {

        const exportFolder = await fs.getEntryWithUrl(directories.exportDir)
        const saveName = `${currentPageName}.psd`
        const entry = await exportFolder.createFile(saveName, {overwrite: true})
        const isSaved = await require('photoshop').core.executeAsModal(savePSD.bind(null, entry))
        if (isSaved) {
            console.log("Successfully saved")
            const ogPage = files[currentPageIndex]
            const updatedPage = {...ogPage, exportPath: `${directories.exportDir}\\${saveName}`}
            const newFiles = files.map((item) => {
                if (item.id == updatedPage.id) {
                    return updatedPage
                } else {
                    return item
                }
            })
            setProjectFiles(newFiles)
        }

    })

    const setNewPageNum = logDecorator(async function setNewPageNum(newPageNum)  {
        // get page number selected.
        // get difference of new number to the original. Update all other pages by this amount as well to keep consistency

        const wantedPageNum = parseInt(newPageNum)
        if (wantedPageNum == NaN) {
            return
        }
        const pageNumDifference = wantedPageNum - pageNumber
        const ogPage = files[currentPageIndex]
        const updatedPage = {...ogPage, pageNumber: ogPage.pageNumber + pageNumDifference}
        const newFiles = files.map((item) => {
            if (item.id == updatedPage.id) {
                return updatedPage
            } else if (item.id > updatedPage.id) {
                return {...item, pageNumber: item.pageNumber + pageNumDifference}
            } else {
                return item
            }
        })
        setPageNumber(pageNumber + pageNumDifference)
        setProjectFiles(newFiles)
        await getPageName(updatedPage)
        console.log("Updated page numbers on current and further files", newFiles)

    })

    const closeOverwriteDialog = logDecorator(async function closeOverwriteDialog()  {
        overwriteAlert.close()

    })


    const closeProjectDialog = logDecorator(async function closeProjectDialog()  {
        projectDialog.close()

    })

    const overwriteCheck = logDecorator(async function overwriteCheck()  {
        if (directories.exportDir.length < 1) {
            alert("No export directory is chosen")
            return
        }

        if (!directories.shouldExport) {
            alert("Enable export")
            return
        }

        const currentFile = `${directories.exportDir}\\${currentPageName}.psd`
        if (await entryExists(currentFile)) {
            await openOverwriteDialog()
        } else {
            await saveFile()
        }

    })
    const overwriteFile = logDecorator(async function overwriteFile()  {
        await closeOverwriteDialog()
        await saveFile()

    })

    // if file is about to be overwritten, show overwrite dialog because uxp doesn't support overwrite dialog by default
    const openOverwriteDialog = logDecorator(async function openOverwriteDialog()  {
        if (!overwriteAlert) {
            overwriteAlert = document.createElement("dialog")
            overwriteAlert.style.padding = "1rem"
            // creates element in the root to server as a dialog
            const root = createRoot(overwriteAlert)
            root.render(<OverwriteModal dialog={overwriteAlert} handleClose={closeOverwriteDialog} fileToOverwriteName={currentPageName}
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


    const openProjectDialog = logDecorator(async function openProjectDialog()  {
        if (!projectDialog) {
            projectDialog = document.createElement("dialog")
            projectDialog.style.padding = "1rem"

            // creates element in the root to server as a dialog
            const root = createRoot(projectDialog)
            root.render(<ProjectModal dialog={projectDialog} handleClose={closeProjectDialog} files={files} saveProject={saveProject}/>)
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

    const savePSD = logDecorator(async function savePSD(entry)  {
        try {
            console.log("Saving as psd", entry)
            const doc = app.activeDocument
            doc.saveAs.psd(entry)
            return true
        } catch (e) {
            showAlert("Function savePSD")
            showAlert(e)
            return false
        }
    })

    const getPresetFileContents = logDecorator(async function getPresetFileContents()  {

        const dataFolder = await fs.getDataFolder()
        if (await entryExists(`${dataFolder.nativePath}\\${presetFileName}`)) {
            console.log("Saved projects file exists already")
            const presetFile = await dataFolder.getEntry(presetFileName)
            const fileContent = await presetFile.read()
            return JSON.parse(fileContent)
        } else {
            console.log("Saved projects file does not exist yet")
            const presetFile = await dataFolder.createFile(presetFileName)
            const initialContent = {}
            presetFile.write(JSON.stringify(initialContent))
            return initialContent
        }

    })
    const writeToPresetFile = logDecorator(async function writeToPresetFile(content)  {

        const dataFolder = await fs.getDataFolder()
        const file = await dataFolder.getEntry(presetFileName)
        await file.write(content)
        console.log('Successfully written new project')

    })

    const removeProject = logDecorator(async function removeProject(inputVal)  {

        const newProjects = {}
        for (let i = 0; i < presets.length; i++) {
            if (presets[i] != inputVal) {
                newProjects[presets[i]] = projects[presets[i]]
            }
        }
        const newPresets = presets.filter((item) => {
            return item != inputVal
        })
        setProjects(newProjects)
        setPresets(newPresets)
        await writeToPresetFile(JSON.stringify(newProjects))
        document.getElementById("saved-projects").selectedIndex = -1

    })

    const saveProject = logDecorator(async function saveProject(inputVal)  {

        const newProjects = await getPresetFileContents()
        newProjects[inputVal] = files
        setPresets(Object.keys(newProjects))
        setProjects(newProjects)
        await writeToPresetFile(JSON.stringify(newProjects))
        await closeProjectDialog()

    })

    const loadProject = logDecorator(async function loadProject(projectName)  {

        const projectContents = await getPresetFileContents()
        const selectedProject = projectContents[projectName]
        setProjectFiles(selectedProject)
        dispatch(setFiles(selectedProject))

    })

    return <div id={"export"}>
        {/*File showcase*/}
        <Section sectionName={"Files"} isTransparent={true}>
            <div>
                <sp-progressbar max={files.length} value={completedNum} style={{width: "100%"}}>
                    <sp-label slot={"label"} size={"small"}>Progress:</sp-label>
                </sp-progressbar>
                <div id={"files"}>
                    {files.map((file, index) => <FileObject scrollRef={index == currentPageIndex ? scrollRef : undefined} name={file.name} status={file.isDone}
                                                            active={index == currentPageIndex} key={index} pageNum={file.pageNumber} goToFunc={goToFile} pageIndex={index}
                    ></FileObject>)}
                </div>
            </div>
            <div class={"fit-row-style"}>
                {isStart &&
                    <div>
                        <ActionButton style={{width: "20%"}} isDisabled={isStart}>{"<"}</ActionButton>
                        <HighlightButton classHandle={"unimportant-button"} style={{width: "60%"}} isDisabled={!isPanelFocused} clickHandler={() => {
                            openStartingFile()
                        }}>Start
                        </HighlightButton>
                        <ActionButton style={{width: "20%"}} isDisabled={isStart}>{">"}</ActionButton>
                    </div>
                }
                {!isStart &&
                    <div>
                        <ActionButton style={{width: "20%"}} clickHandler={() => {
                            goToNextFile(false)
                        }} isDisabled={isStart || !isPanelFocused}>{"<"}</ActionButton>
                        <ActionButton style={{width: "60%"}} clickHandler={() => {
                            changeFileStatus(currentPageIndex)
                        }} isDisabled={isStart || !isPanelFocused}>Complete
                        </ActionButton>
                        <ActionButton style={{width: "20%"}} clickHandler={() => {
                            goToNextFile(true)
                        }} isDisabled={isStart || !isPanelFocused}>{">"}</ActionButton>
                    </div>
                }
            </div>
                <div class={"fit-row-style"}>
                    <HighlightButton classHandle={"unimportant-button button-100"} clickHandler={() => {
                        overwriteCheck()
                    }} isDisabled={isStart || !isPanelFocused}>Save
                    </HighlightButton>
                </div>
        </Section>

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
                <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                    setNewPageNum(document.getElementById("page-number-input").value)
                }} isDisabled={isStart || !isPanelFocused}>Set</HighlightButton>
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>{currentPageName}</sp-heading>
        </Section>

        <Section isTransparent={true} sectionName={"project"}>
            <sp-picker class={"button-100"} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} id={"saved-projects"}>
                    {presets.map((item, index) => {
                        return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                    })}
                </sp-menu>
            </sp-picker>
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "50%"}} clickHandler={() => {
                    removeProject(document.getElementById("saved-projects").value)
                }} isDisabled={!isPanelFocused}>Remove
                </ActionButton>
                <ActionButton style={{width: "50%"}} clickHandler={() => loadProject(document.getElementById("saved-projects").value)} isDisabled={!isPanelFocused}>Load</ActionButton>
            </div>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                openProjectDialog()
            }} isDisabled={!isPanelFocused}>Save
            </HighlightButton>
        </Section>

    </div>
}