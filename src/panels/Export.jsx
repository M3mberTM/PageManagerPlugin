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
import {logToFile} from "../helpers/Logger";
import {app} from "photoshop";
import {core} from "photoshop";
import {storage} from 'uxp';
import {showAlert, entryExists} from "../helpers/helper";
import {ActionButton} from "../components/ActionButton";

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
    const elementScrollToView = () => {
        try {
            scrollRef.current.scrollIntoView({behavior: 'smooth'})
        } catch (e) {
            showAlert("Function elementScrollToView")
            showAlert(e)
        }
    }

    const openFile = async (pageIndex) => {
        try {
            await logToFile(`openFile(${pageIndex})`, false)
            const app = window.require("photoshop").app
            let fileEntry = null
            if (files[pageIndex].exportPath.length > 1) {
                console.log(files[pageIndex].exportPath)
                fileEntry = await fs.getEntryWithUrl(files[pageIndex].exportPath)
            } else {
                fileEntry = await fs.getEntryWithUrl(files[pageIndex].filename)
            }
            await app.open(fileEntry)
        } catch (e) {
            await logToFile(`openFile(${pageIndex});${e}`, true)
            showAlert("Function openFile")
            showAlert(e)
        }
    }

    const openNextFile = async (pageNum) => {
        try {
            await logToFile(`openNextFile(${pageNum})`, false)
            // current function changes the state in photoshop, therefore it is called using executeAsModal
            await core.executeAsModal(() => openFile(pageNum))
        } catch (e) {
            await logToFile(`openNextFile(${pageNum});${e}`, true)
            showAlert("Function openNextFile")
            showAlert(e)
        }
    }

    const goToFile = async (pageIndex) => {
        try {
            await logToFile(`goToFile(${pageIndex})`, false)
            const currentDoc = app.activeDocument
            setCurrentPageIndex(pageIndex)
            const newPageNum = files[pageIndex].pageNumber
            setPageNumber(newPageNum)
            // Changes state of the Photoshop application, executeAsModal has to be used
            await core.executeAsModal(() => openFile(pageIndex))
            await core.executeAsModal(() => closeFile(currentDoc))
        } catch (e) {
            await logToFile(`goToFile(${pageIndex});${e}`, true)
            showAlert("Function goToFile")
            showAlert(e)
        }
    }

    const goToNextFile = async (isForward) => {
        if (!isLoadingFile.current) {
            isLoadingFile.current = true
            try {
                await logToFile(`goToNextFile(${isForward})`, false)
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
                elementScrollToView()
            } catch (e) {
                await logToFile(`goToNextFile(${isForward});${e}`, true)
                showAlert("Function goToNextFile")
                showAlert(e)
            }
            isLoadingFile.current = false
        }
    }

    const closeFile = async (document) => {
        try {
            await logToFile(`closeFile(${document})`, false)
            await document.close()
        } catch (e) {
            await logToFile(`closeFile(${document});${e}`, true)
            showAlert("Function closeFile")
            showAlert(e)
        }
    }

    // Changes the file status to complete if not completed and vice versa
    const changeFileStatus = async (index) => {
        try {
            await logToFile(`changeFileStatus(${index})`, false)
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
        } catch (e) {
            await logToFile(`changeFileStatus(${index});${e}`, true)
            showAlert("Function changeFileStatus")
            showAlert(e)
        }
    }

    const openStartingFile = async () => {
        try {
            await logToFile(`openStartingFile()`, false)
            if (files.length > 0) {
                await openNextFile(0)
                setIsStart(false)
                await getPageName(files[0])
            } else {
                alert("No files were loaded")
            }
        } catch (e) {
            await logToFile(`openStartingFile();${e}`, true)
            showAlert("Function openStartingFile")
            showAlert(e)
        }
    }

    const addLeadingZeros = async (num, size) => {
        try {
            await logToFile(`addLeadingZeros(${num},${size})`, false)
            return String(num).padStart(size, '0')
        } catch (e) {
            await logToFile(`addLeadingZeros(${num},${size});${e}`, true)
            showAlert("Function aadLeadingZeros")
            showAlert(e)
        }
    }

    // gets the page name according to the template given in Naming panel
    const getPageName = async (currentPage) => {
        try {
            await logToFile(`getPageName(${currentPage})`, false)
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
                const paddedNum = await addLeadingZeros(currentPage.pageNumber, padLength)
                leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
            }
            const finalName = leadingZerosAppend.replace(/\.[\w\d]+$/, "")

            setCurrentPageName(finalName)
        } catch (e) {
            await logToFile(`getPageName(${currentPage});${e}`, true)
            showAlert("Function getPageName")
            showAlert(e)
        }
    }

    const saveFile = async () => {
        try {
            await logToFile(`saveFile()`, false)
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
        } catch (e) {
            await logToFile(`saveFile();${e}`, true)
            showAlert("Function saveFile")
            showAlert(e)
        }
    }

    const setNewPageNum = async (newPageNum) => {
        // get page number selected.
        // get difference of new number to the original. Update all other pages by this amount as well to keep consistency
        try {
            await logToFile(`setNewPageNum(${newPageNum})`, false)
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
        } catch (e) {
            await logToFile(`setNewPageNum(${newPageNum});${e}`, true)
            showAlert("Function setNewPageNum")
            showAlert(e)
        }
    }

    const closeOverwriteDialog = async () => {
        try {
            await logToFile(`closeOverwriteDialog()`, false)
            overwriteAlert.close()
        } catch (e) {
            await logToFile(`closeOverwriteDialog();${e}`, true)
            showAlert("Function close overwrite dialog")
            showAlert(e)
        }
    }


    const closeProjectDialog = async () => {
        try {
            await logToFile(`closeProjectDialog()`, false)
            projectDialog.close()
        } catch (e) {
            await logToFile(`closeProjectDialog();${e}`, true)
            showAlert("Function close Project dialog")
            showAlert(e)
        }
    }

    const overwriteCheck = async () => {
        try {
            await logToFile(`overwriteCheck()`, false)
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
        } catch (e) {
            await logToFile(`overwriteCheck();${e}`, true)
            showAlert("Function overwriteCheck")
            showAlert(e)
        }
    }
    const overwriteFile = async () => {
        try {
            await logToFile(`overwriteFile()`, false)
            await closeOverwriteDialog()
            await saveFile()
        } catch (e) {
            await logToFile(`overwriteFile();${e}`, true)
            showAlert("Function overwriteFile")
            showAlert(e)
        }
    }

    // if file is about to be overwritten, show overwrite dialog because uxp doesn't support overwrite dialog by default
    const openOverwriteDialog = async () => {
        try {
            await logToFile(`openOverwriteDialog()`, false)
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
        } catch (e) {
            await logToFile(`openOverwriteDialog();${e}`, true)
            showAlert("Function openOverwriteDialog")
            showAlert(e)
        }
    }


    const openProjectDialog = async () => {
        try {
            await logToFile(`openProjectDialog()`, false)
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
        } catch (e) {
            await logToFile(`openProjectDialog();${e}`, true)
            showAlert("Function openOverwriteDialog")
            showAlert(e)
        }
    }

    const savePSD = async (entry) => {
        try {
            await logToFile(`savePSD(${entry})`, false)
            console.log("Saving as psd", entry)
            const doc = app.activeDocument
            doc.saveAs.psd(entry)
            return true
        } catch (e) {
            await logToFile(`savePSD();${e}`, true)
            showAlert("Function savePSD")
            showAlert(e)
            return false
        }
    }

    const getPresetFileContents = async () => {
        try {
            await logToFile(`getPresetFileContents()`, false)
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
        } catch (e) {
            await logToFile(`getPresetFileContents();${e}`, true)
            showAlert("Function load preset")
            showAlert(e)
        }
    }
    const writeToPresetFile = async (content) => {
        try {
            await logToFile(`writeToPresetFile(${content})`, false)
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new project')
        } catch (e) {
            await logToFile(`writeToPresetFile(${content});${e}`, true)
            showAlert("Function add to preset file")
            showAlert(e)
        }
    }

    const removeProject = async (inputVal) => {
        try {
            await logToFile(`removeProject(${inputVal})`, false)
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
        } catch (e) {
            await logToFile(`removeProject(${inputVal});${e}`, true)
            showAlert("Function remove Project")
            showAlert(e)
        }
    }

    const saveProject = async (inputVal) => {
        try {
            await logToFile(`saveProject(${inputVal})`, false)
            const newProjects = await getPresetFileContents()
            newProjects[inputVal] = files
            setPresets(Object.keys(newProjects))
            setProjects(newProjects)
            await writeToPresetFile(JSON.stringify(newProjects))
            await closeProjectDialog()
        } catch (e) {
            await logToFile(`saveProject(${inputVal});${e}`, true)
            showAlert("Function save Project")
            showAlert(e)
        }
    }

    const loadProject = async (projectName) => {
        try {
            await logToFile(`loadProject(${projectName})`, false)
            const projectContents = await getPresetFileContents()
            const selectedProject = projectContents[projectName]
            setProjectFiles(selectedProject)
            dispatch(setFiles(selectedProject))
        } catch (e) {
            await logToFile(`loadProject(${projectName});${e}`, true)
            showAlert("Function loadProject")
            showAlert(e)
        }
    }

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
                        <ActionButton classHandle={"unimportant-button"} style={{width: "60%"}} clickHandler={() => {
                            openStartingFile()
                        }}>Start
                        </ActionButton>
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
                    <ActionButton classHandle={"unimportant-button button-100"} clickHandler={() => {
                        overwriteCheck()
                    }} isDisabled={isStart || !isPanelFocused}>Save
                    </ActionButton>
                </div>
        </Section>

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
                <ActionButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                    setNewPageNum(document.getElementById("page-number-input").value)
                }} isDisabled={isStart || !isPanelFocused}>Set</ActionButton>
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
            <ActionButton classHandle={"button-100 unimportant-button"} clickHandler={() => {
                openProjectDialog()
            }} isDisabled={!isPanelFocused}>Save
            </ActionButton>
        </Section>

    </div>
}