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
import {logToFile} from "../components/Logger";

// unfortunately, I couldn't find the react way to import uxp stuff it is imported using normal node.js way
const fs = require('uxp').storage.localFileSystem;
const core = require('photoshop').core
const app = require("photoshop").app;

export const Export = () => {
    const [files, setProjectFiles] = useState([])
    const dirFiles = useSelector(state => state.fileSlice.value)
    const namingTemplate = useSelector((state) => state.templateSlice.value)
    const dirs = useSelector((state) => state.folderSlice.value)
    const scrollRef = useRef()
    const [directories, setDirectories] = useState({})
    const [isPanelFocused, setIsPanelFocused] = useState(false)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [completedNum, setCompletedNum] = useState(0)
    const [pageNumber, setPageNumber] = useState(0)
    const [isStart, setIsStart] = useState(true)
    const [currentPageName, setCurrentPageName] = useState("")
    const [presets, setPresets] = useState([])
    const [projects, setProjects] = useState({})
    let overwriteAlert = null
    let projectDialog = null
    const presetFileName = 'projects.txt'
    const dispatch = useDispatch()

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
        effectPageName()
    }, [namingTemplate])

    // Updates the saved projects list
    useEffect(async () => {
        const effectProjectContents = async () => {
            const projectContents = await getPresetFileContents()
            console.log(projectContents)
            setProjects(projectContents)
            setPresets(Object.keys(projectContents))
        }
        effectProjectContents()
    }, [])

    //Updates the import and export directories
    useEffect(() => {
        setDirectories(dirs)
        console.log(dirs)
    }, [dirs])

    // automatically scrolls to the current file opened in the file list
    const elementScrollToView = () => {
        try {
            scrollRef.current.scrollIntoView({behavior: 'smooth'})
        } catch (e) {
            alert("Function elementScrollToView")
            alert(e)
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
            alert("Function openFile")
            alert(e)
        }
    }

    const openNextFile = async (pageNum) => {
        try {
            await logToFile(`openNextFile(${pageNum})`, false)
            // current function changes the state in photoshop, therefore it is called using executeAsModal
            await core.executeAsModal(() => openFile(pageNum))
        } catch (e) {
            await logToFile(`openNextFile(${pageNum});${e}`, true)
            alert("Function openNextFile")
            alert(e)
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
            alert("Function goToFile")
            alert(e)
        }
    }

    const goToNextFile = async (isForward) => {
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
            alert("Function goToNextFile")
            alert(e)
        }
    }

    const closeFile = async (document) => {
        try {
            await logToFile(`closeFile(${document})`, false)
            await document.close()
        } catch (e) {
            await logToFile(`closeFile(${document});${e}`, true)
            alert("Function closeFile")
            alert(e)
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
            alert("Function changeFileStatus")
            alert(e)
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
            alert("Function openStartingFile")
            alert(e)
        }
    }

    const addLeadingZeros = async (num, size) => {
        try {
            await logToFile(`addLeadingZeros(${num},${size})`, false)
            return String(num).padStart(size, '0')
        } catch (e) {
            await logToFile(`addLeadingZeros(${num},${size});${e}`, true)
            alert("Function aadLeadingZeros")
            alert(e)
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
            alert("Function getPageName")
            alert(e)
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
            alert("Function saveFile")
            alert(e)
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
            console.log(newFiles)
            console.log("Updated page numbers on current and further files")
        } catch (e) {
            await logToFile(`setNewPageNum(${newPageNum});${e}`, true)
            alert("Function setNewPageNum")
            alert(e)
        }
    }

    const closeOverwriteDialog = async () => {
        try {
            await logToFile(`closeOverwriteDialog()`, false)
            overwriteAlert.close()
        } catch (e) {
            await logToFile(`closeOverwriteDialog();${e}`, true)
            alert("Function close overwrite dialog")
            alert(e)
        }
    }


    const closeProjectDialog = async () => {
        try {
            await logToFile(`closeProjectDialog()`, false)
            projectDialog.close()
        } catch (e) {
            await logToFile(`closeProjectDialog();${e}`, true)
            alert("Function close Project dialog")
            alert(e)
        }
    }

    const fileExists = async (file) => {
        try {
            await logToFile(`fileExists(${file})`, false)
            const entry = await fs.getEntryWithUrl(`${file}`)
            await entry.getMetadata()
            return true
        } catch (e) {
            return false
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
            if (await fileExists(currentFile)) {
                await openOverwriteDialog()
            } else {
                await saveFile()
            }
        } catch (e) {
            await logToFile(`overwriteCheck();${e}`, true)
            alert("Function overwriteCheck")
            alert(e)
        }
    }
    const overwriteFile = async () => {
        try {
            await logToFile(`overwriteFile()`, false)
            await closeOverwriteDialog()
            await saveFile()
        } catch (e) {
            await logToFile(`overwriteFile();${e}`, true)
            alert("Function overwriteFile")
            alert(e)
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
            alert("Function openOverwriteDialog")
            alert(e)
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
            alert("Function openOverwriteDialog")
            alert(e)
        }
    }

    const savePSD = async (entry) => {
        try {
            await logToFile(`savePSD(${entry})`, false)
            console.log("Saving as psd")
            const doc = app.activeDocument
            doc.saveAs.psd(entry)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    const getPresetFileContents = async () => {
        try {
            await logToFile(`getPresetFileContents()`, false)
            const dataFolder = await fs.getDataFolder()
            console.log(dataFolder.nativePath)
            if (await fileExists(`${dataFolder.nativePath}\\${presetFileName}`)) {
                console.log("File exists already")
                const presetFile = await dataFolder.getEntry(presetFileName)
                const fileContent = await presetFile.read()
                console.log(JSON.parse(fileContent))
                return JSON.parse(fileContent)
            } else {
                console.log("File does not exist yet")
                const presetFile = await dataFolder.createFile(presetFileName)
                const initialContent = {}
                presetFile.write(JSON.stringify(initialContent))
                return initialContent
            }
        } catch (e) {
            await logToFile(`getPresetFileContents();${e}`, true)
            alert("Function load preset")
            alert(e)
        }
    }
    const writeToPresetFile = async (content) => {
        try {
            await logToFile(`writeToPresetFile(${content})`, false)
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new preset')
        } catch (e) {
            await logToFile(`writeToPresetFile(${content});${e}`, true)
            alert("Function add to preset file")
            alert(e)
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
            alert("Function remove Project")
            alert(e)
        }
    }

    const saveProject = async (inputVal) => {
        try {
            await logToFile(`saveProject(${inputVal})`, false)
            const newProjects = await getPresetFileContents()
            newProjects[inputVal] = files
            setPresets(Object.keys(newProjects))
            setProjects(newProjects)
            console.log(newProjects)
            await writeToPresetFile(JSON.stringify(newProjects))
            await closeProjectDialog()
        } catch (e) {
            await logToFile(`saveProject(${inputVal});${e}`, true)
            alert("Function save Project")
            alert(e)
        }
    }

    const loadProject = async (projectName) => {
        try {
            await logToFile(`loadProject(${projectName})`, false)
            console.log("Before presetLoading")
            const projectContents = await getPresetFileContents()
            console.log("Before selecting projct")
            const selectedProject = projectContents[projectName]
            setProjectFiles(selectedProject)
            dispatch(setFiles(selectedProject))
        } catch (e) {
            await logToFile(`loadProject(${projectName});${e}`, true)
            alert("Function loadProject")
            alert(e)
        }
    }

    if (!isPanelFocused) {
        return <div id={"export"}>

        </div>
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
                                                            active={index == currentPageIndex} key={index} pageNum={file.pageNumber} goToFunc={goToFile}
                    ></FileObject>)}
                </div>
            </div>
            <div class={"fit-row-style"}>
                {isStart &&
                    <div>
                        <sp-action-button style={{width: "20%"}} disabled>{"<"}</sp-action-button>
                        <sp-action-button className={"unimportant-button"} style={{width: "60%"}} onClick={() => {
                            openStartingFile()
                        }}>Start
                        </sp-action-button>
                        <sp-action-button style={{width: "20%"}} disabled>{">"}</sp-action-button>
                    </div>
                }
                {!isStart &&
                    <div>
                        <sp-action-button style={{width: "20%"}} onClick={() => {
                            goToNextFile(false)
                        }}>{"<"}</sp-action-button>
                        <sp-action-button style={{width: "60%"}} onClick={() => {
                            changeFileStatus(currentPageIndex)
                        }}>Complete
                        </sp-action-button>
                        <sp-action-button style={{width: "20%"}} onClick={() => {
                            goToNextFile(true)
                        }}>{">"}</sp-action-button>
                    </div>
                }
            </div>
            {isStart &&
                <div class={"fit-row-style"}>
                    <sp-action-button class={"button-100"} disabled>Save</sp-action-button>
                </div>
            }

            {!isStart &&
                <div class={"fit-row-style"}>
                    <sp-action-button class={"unimportant-button button-100"} onClick={() => {
                        overwriteCheck()
                    }}>Save
                    </sp-action-button>
                </div>
            }
        </Section>

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
            {isStart &&
                <sp-action-button class={"button-100"} disabled>Set</sp-action-button>
            }
            {!isStart &&
                <sp-action-button class={"button-100 unimportant-button"} onClick={() => {
                    setNewPageNum(document.getElementById("page-number-input").value)
                }}>Set</sp-action-button>
            }
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>{currentPageName}</sp-heading>
        </Section>

        <Section isTransparent={true} sectionName={"project"}>
            <sp-dropdown class={"button-100"} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} id={"saved-projects"}>
                    {presets.map((item, index) => {
                        return <sp-menu-item key={index} value={item}>{item}</sp-menu-item>
                    })}
                </sp-menu>
            </sp-dropdown>
            <div class={"fit-row-style"}>
                <sp-action-button style={{width: "50%"}} onClick={() => {
                    removeProject(document.getElementById("saved-projects").value)
                }}>Remove
                </sp-action-button>
                <sp-action-button style={{width: "50%"}} onClick={() => loadProject(document.getElementById("saved-projects").value)}>Load</sp-action-button>
            </div>
            <sp-action-button class={"button-100 unimportant-button"} onClick={() => {
                openProjectDialog()
            }}>Save
            </sp-action-button>
        </Section>

    </div>
}