import React, {useEffect, useRef} from 'react';
import {Section} from "../../components/section/Section";
import {useState} from "react";
import "./Movement.css";
import "../../components/CommonStyles.css";
import {FileObject} from "../../components/fileObject/FileObject";
import {useSelector} from "react-redux";
import {createRoot} from "react-dom";
import {OverwriteModal} from "../../modals/overwrite/OverwriteModal";
import {ProjectModal} from "../../modals/project/ProjectModal";
import {useDispatch} from "react-redux";
// import {setFiles} from "../../redux/fileSlice";
import {logDecorator} from "../../utils/Logger";
import {core} from "photoshop";
import {storage} from 'uxp';
import {showAlert, entryExists, readFile, writeToFile} from "../../utils/helper";
import {ActionButton} from "../../components/actionButton/ActionButton";
import {HighlightButton} from "../../components/highlightButton/HighlightButton";
import {PROJECT_FILE, STORAGE_FOLDER, PATH_DELIMITER} from "../../utils/constants";
import {useSetUp} from "../../utils/presetManager";

const fs = storage.localFileSystem;

export const Movement = () => {
    useSetUp()
    // states
    const [projectFiles, setProjectFiles] = useState([])
    const [directories, setDirectories] = useState({})
    const [isPanelFocused, setIsPanelFocused] = useState(false)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [completedNum, setCompletedNum] = useState(0)
    const [pageNumber, setPageNumber] = useState(0)
    const [isStart, setIsStart] = useState(true)
    const [currentPageName, setCurrentPageName] = useState("")
    const [projects, setProjects] = useState({})
    // other variables
    let overwriteAlert = null
    let projectDialog = null
    const isLoadingFile = useRef(false)
    const presetFile = `${STORAGE_FOLDER}${PATH_DELIMITER}${PROJECT_FILE}`
    const dispatch = useDispatch()
    const scrollRef = useRef()
    const currentDoc = useRef(undefined)
    const previousDoc = useRef(undefined)
    // selectors
    const dirFiles = useSelector(state => state.fileSlice.value)
    const namingTemplate = useSelector((state) => state.templateSlice.value)
    const dirs = useSelector((state) => state.folderSlice.value)
    const isFocus = useSelector(state => state.helperSlice.isFocused)
    const savedProjects = useSelector(state => state.projectSlice.savedProjects)
    const settings = useSelector(state => state.settingsSlice)

    // disables buttons (is on when there is a file picker)
    useEffect(() => {
        setIsPanelFocused(isFocus)
    }, [isFocus])

    // loads the saved projects from files
    useEffect(() => {
        console.log("Saved projects: ", savedProjects)
        setProjects(savedProjects)
    }, [savedProjects])

    // updates the files shown each time they are changed in the other panels
    useEffect(() => {
        const loadedFiles = [...dirFiles]
        setProjectFiles(loadedFiles)
        setCurrentPageIndex(0)
        setPageNumber(0)
        setIsStart(true)
        setCompletedNum(0)
    }, [dirFiles])

    // Updates the page name each time it is changed in the Naming panel
    useEffect(() => {
        if (projectFiles.length > 0) {
            getPageName(projectFiles[currentPageIndex]).then((pageName) => {
                setCurrentPageName(pageName)
            })
        }
    }, [namingTemplate])


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
        if (projectFiles[pageIndex].exportPath.length > 1) {
            fileEntry = await fs.getEntryWithUrl(projectFiles[pageIndex].exportPath)
        } else {
            fileEntry = await fs.getEntryWithUrl(projectFiles[pageIndex].filename)
        }
        previousDoc.current = currentDoc.current
        currentDoc.current = await app.open(fileEntry)
        if (!previousDoc.current) {
            previousDoc.current = currentDoc.current
        }
        console.log("Opened document: ", currentDoc.current)
        if (settings.docSaveOnOpen) {
            const pageName = await getPageName(projectFiles[pageIndex])
            if (projectFiles[pageIndex].exportPath.length < 1) {
                await overwriteCheck(pageName)
            }
        }
    })

    const openNextFile = logDecorator(async function openNextFile(pageNum)  {
        // current function changes the state in photoshop, therefore it is called using executeAsModal
        await core.executeAsModal(() => openFile(pageNum))

    })

    const goToFile = logDecorator(async function goToFile(pageIndex)  {
        // if the person is stupid enough to double click the file he is on, this will prevent it
        if (pageIndex === currentPageIndex) {
           return
        }
        // goes to the specified file in list based on index of it
        const newPageNum = projectFiles[pageIndex].pageNumber
        const pageName = await getPageName(projectFiles[pageIndex])
        // Changes state of the Photoshop application, executeAsModal has to be used
        await core.executeAsModal(() => openFile(pageIndex))
        await core.executeAsModal(() => closeFile(previousDoc.current))
        setCurrentPageIndex(pageIndex)
        setPageNumber(newPageNum)
        setCurrentPageName(pageName)
        if (isStart) {
            setIsStart(false)
        }

    })

    const goToNextFile = logDecorator(async function goToNextFile(isForward)  {
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

    const closeFile = logDecorator(async function closeFile(document)  {
        await document.close()
        console.log("Closed document ", document)
    })

    // Changes the file status to complete if not completed and vice versa
    const changeFileStatus = logDecorator(function changeFileStatus(index)  {

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

    const openStartingFile = logDecorator(async function openStartingFile()  {
        if (projectFiles.length > 0) {
            await openNextFile(0)
            setIsStart(false)
            const pageName = await getPageName(projectFiles[0])
            setCurrentPageName(pageName)
        } else {
            alert("No files were loaded")
        }

    })

    const addLeadingZeros = logDecorator(function addLeadingZeros(num, size)  {
        return String(num).padStart(size, '0')
    })

    // gets the page name according to the template given in Naming panel
    const getPageName = logDecorator(async function getPageName(currentPage)  {
        // if there is no template, just use the normal page name
        if (namingTemplate.length < 1) {
            return currentPage.name.replace(/\.[\w\d]+$/, "")
        }
        // if there is template, replace each specific pattern for it's part
        const originalNameAppend = namingTemplate.replaceAll("%og%", currentPage.name)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(currentPage.pageNumber))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = await addLeadingZeros(currentPage.pageNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        return leadingZerosAppend.replace(/\.[\w\d]+$/, "")

    })

    const saveFile = logDecorator(async function saveFile(pageName)  {
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

    const setNewPageNum = logDecorator(async function setNewPageNum(newPageNum)  {
        // get page number selected.
        // get difference of new number to the original. Update all other pages by this amount as well to keep consistency

        const wantedPageNum = parseInt(newPageNum)
        if (wantedPageNum == NaN) {
            return
        }
        const pageNumDifference = wantedPageNum - pageNumber
        const ogPage = projectFiles[currentPageIndex]
        const updatedPage = {...ogPage, pageNumber: ogPage.pageNumber + pageNumDifference}
        const newFiles = projectFiles.map((item) => {
            if (item.id === updatedPage.id) {
                return updatedPage
            } else if (item.id > updatedPage.id) {
                return {...item, pageNumber: item.pageNumber + pageNumDifference}
            } else {
                return item
            }
        })
        setPageNumber(pageNumber + pageNumDifference)
        setProjectFiles(newFiles)
        const pageName = await getPageName(updatedPage)
        setCurrentPageName(pageName)
        console.log("Updated page numbers on current and further files", newFiles)

    })

    const overwriteCheck = logDecorator(async function overwriteCheck(pageName)  {
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
    const overwriteFile = logDecorator(async function overwriteFile(pageName)  {
        overwriteAlert.close()
        await saveFile(pageName)

    })

    // if file is about to be overwritten, show overwrite dialog because uxp doesn't support overwrite dialog by default
    const openOverwriteDialog = logDecorator(async function openOverwriteDialog(pageName)  {
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


    const openProjectDialog = logDecorator(async function openProjectDialog()  {
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

    const savePSD = logDecorator(async function savePSD(entry)  {
        try {
            currentDoc.current.saveAs.psd(entry)
            return true
        } catch (e) {
            showAlert("Function savePSD")
            showAlert(e)
            return false
        }
    })

    const removeProject = logDecorator(async function removeProject(inputVal)  {
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
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`,JSON.stringify(newProjects))
        console.log("Removed project. Current projects: ", newProjects)
        // do this to unselect anything in the dropdown menu
        document.getElementById("saved-projects").selectedIndex = -1

    })

    const saveProject = logDecorator(async function saveProject(inputVal)  {
        projectDialog.close()
        const dataFolder = await fs.getDataFolder()
        const dataFolderPath = dataFolder.nativePath
        const newProject = {}
        newProject[inputVal] = projectFiles
        const newProjects = {...projects, ...newProject}

        setProjects(newProjects)
        await writeToFile(`${dataFolderPath}${PATH_DELIMITER}${presetFile}`,JSON.stringify(newProjects))
        console.log("New project saved", newProject)

    })

    const loadProject = logDecorator(async function loadProject(projectName)  {
        if (!projectName) {
            return
        }
        const selectedProject = projects[projectName]
        setProjectFiles(selectedProject)
        dispatch(setFiles(selectedProject))

    })

    return <div id={"export"}>
        {/*File showcase*/}
        <Section sectionName={"Files"} isTransparent={true}>
            <div>
                <sp-progressbar max={projectFiles.length} value={completedNum} style={{width: "100%"}}>
                    <sp-label slot={"label"} size={"small"}>Progress:</sp-label>
                </sp-progressbar>
                <div id={"files"}>
                    {projectFiles.map((file, index) => <FileObject scrollRef={index === currentPageIndex ? scrollRef : undefined} name={file.name} status={file.isDone}
                                                            active={index === currentPageIndex} key={index} pageNum={file.pageNumber} goToFunc={goToFile} pageIndex={index}
                    ></FileObject>)}
                </div>
            </div>
            <div class={"fit-row-style"}>
                {isStart &&
                    <div>
                        <ActionButton style={{width: "20%"}} isDisabled={isStart}>{"<"}</ActionButton>
                        <HighlightButton classHandle={"unimportant-button"} style={{width: "60%"}} isDisabled={!isPanelFocused} clickHandler={() => {
                            openStartingFile().then()
                        }}>Start
                        </HighlightButton>
                        <ActionButton style={{width: "20%"}} isDisabled={isStart}>{">"}</ActionButton>
                    </div>
                }
                {!isStart &&
                    <div>
                        <ActionButton style={{width: "20%"}} clickHandler={() => {
                            goToNextFile(false).then()
                        }} isDisabled={isStart || !isPanelFocused}>{"<"}</ActionButton>
                        <ActionButton style={{width: "60%"}} clickHandler={() => {
                            changeFileStatus(currentPageIndex).then()
                        }} isDisabled={isStart || !isPanelFocused}>Complete
                        </ActionButton>
                        <ActionButton style={{width: "20%"}} clickHandler={() => {
                            goToNextFile(true).then()
                        }} isDisabled={isStart || !isPanelFocused}>{">"}</ActionButton>
                    </div>
                }
            </div>
                <div class={"fit-row-style"}>
                    <HighlightButton classHandle={"unimportant-button button-100"} clickHandler={() => {
                        overwriteCheck(currentPageName).then()
                    }} isDisabled={isStart || !isPanelFocused}>Save
                    </HighlightButton>
                </div>
        </Section>

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
                <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                    setNewPageNum(document.getElementById("page-number-input").value).then()
                }} isDisabled={isStart || !isPanelFocused}>Set</HighlightButton>
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>{currentPageName}</sp-heading>
        </Section>

        <Section isTransparent={true} sectionName={"project"}>
            <sp-picker class={"button-100"} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} id={"saved-projects"}>
                    {Object.keys(projects).map((item, index) => {
                        return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                    })}
                </sp-menu>
            </sp-picker>
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "50%"}} clickHandler={() => {
                    removeProject(document.getElementById("saved-projects").value).then()
                }} isDisabled={!isPanelFocused}>Remove
                </ActionButton>
                <ActionButton style={{width: "50%"}} clickHandler={() => loadProject(document.getElementById("saved-projects").value)} isDisabled={!isPanelFocused}>Load</ActionButton>
            </div>
            <HighlightButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                openProjectDialog().then()
            }} isDisabled={!isPanelFocused}>Save
            </HighlightButton>
        </Section>

    </div>
}