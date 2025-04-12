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

    useEffect(() => {
        // sorts the files in the same way as the file explorer does
        const loadedFiles = [...dirFiles]
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        const sortedFiles = loadedFiles.sort((a, b) => collator.compare(a.name, b.name))
        setProjectFiles(sortedFiles)
        setCurrentPageIndex(0)
        setPageNumber(0)
        setIsStart(true)
    }, [dirFiles])

    useEffect(() => {
        if (files.length > 0) {
            getPageName(files[currentPageIndex])
        }
    }, [namingTemplate])

    useEffect(async () => {
        const projectContents = await getPresetFileContents()
        console.log(projectContents)
        setProjects(projectContents)
        setPresets(Object.keys(projectContents))
    }, [])

    useEffect(() => {
        setDirectories(dirs)
        console.log(dirs)
    }, [dirs])

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
            alert("Function openFile")
            alert(e)
        }
    }

    const openNextFile = async (pageNum) => {
        try {
            await core.executeAsModal(() => openFile(pageNum))
        } catch (e) {
            alert("Function openNextFile")
            alert(e)
        }
    }

    const goToFile = async (pageIndex) => {
       try {
           const currentDoc = app.activeDocument
           setCurrentPageIndex(pageIndex)
           const newPageNum = files[pageIndex].pageNumber
           setPageNumber(newPageNum)
           await core.executeAsModal(() => openFile(pageIndex))
           await core.executeAsModal(() => closeFile(currentDoc))
       } catch(e){
           alert("Function goToFile")
           alert(e)
       }
    }

    const goToNextFile = async (isForward) => {
        try {
            if (isStart) {
                setIsStart(false)
            }
            const current = currentPageIndex
            console.log(currentPageIndex)
            const currentPageNum = files[currentPageIndex].pageNumber
            const filesLength = files.length
            const currentDoc = app.activeDocument
            console.log(currentDoc)
            if (isForward) {
                if (current != filesLength - 1) {
                    setCurrentPageIndex(current + 1)
                    setPageNumber(currentPageNum + 1)
                    console.log(`Page number: ${currentPageNum + 1}`)
                    console.log(`Current page: ${current + 1}`)
                    await openNextFile(current + 1)
                    getPageName(files[current + 1])
                    await core.executeAsModal(() => closeFile(currentDoc))
                } else {
                    alert("Congratulation, you are done!")
                }
            } else {
                if (current != 0) {
                    setCurrentPageIndex(current - 1)
                    setPageNumber(currentPageNum - 1)
                    console.log(`Page number: ${currentPageNum - 1}`)
                    console.log(`Current page: ${current + 1}`)
                    await openNextFile(current - 1)
                    getPageName(files[current - 1])
                    await core.executeAsModal(() => closeFile(currentDoc))
                }
            }
            elementScrollToView()
            console.log("Closed the file")
        } catch (e) {
            alert("Function goToNextFile")
            alert(e)
        }
    }

    const closeFile = async (document) => {
        try {
            await document.close()
        } catch (e) {
            alert("Function closeFile")
            alert(e)
        }
    }

    const changeFileStatus = (index) => {
        try {
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
            alert("Function changeFileStatus")
            alert(e)
        }
    }

    const openStartingFile = async () => {
        try {
            if (files.length > 0) {
                await openNextFile(0)
                setIsStart(false)
                getPageName(files[0])
            } else {
                alert("No files were loaded")
            }
        } catch (e) {
            alert("Function openStartingFile")
            alert(e)
        }
    }

    const addLeadingZeros = (num, size) => {
        try {
            return String(num).padStart(size, '0')
        } catch (e) {
            alert("Function aadLeadingZeros")
            alert(e)
        }
    }

    const getPageName = (currentPage) => {
        try {
            console.log(currentPage)
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
        } catch (e) {
            alert("Function getPageName")
            alert(e)
        }
    }

    const markPageAsDouble = () => {
        try {
            if (currentPageIndex < files.length - 1) {
                const currentPageA = files[currentPageIndex]
                const isDoubleCurrent = currentPageA.isDouble.length > 0
                const updatedPageA =  isDoubleCurrent ? {...currentPageA, isDouble: ""} : {...currentPageA, isDouble: "a"}
                const currentPageB = files[currentPageIndex + 1]
                const updatedPageB = isDoubleCurrent ? {...currentPageB, pageNumber: currentPageB.pageNumber + 1, isDouble: ""} : {...currentPageB, pageNumber: currentPageB.pageNumber - 1,  isDouble: "a"}
                const newFiles = files.map((item)=> {
                    if (item.id == updatedPageA.id) {
                        return updatedPageA
                    } else if (item.id == updatedPageB.id) {
                        return updatedPageB
                    } else {
                        if (isDoubleCurrent) {
                            return {...item, pageNumber: item.pageNumber + 1}
                        } else {
                            return {...item, pageNumber: item.pageNumber - 1}
                        }
                    }
                })
                setProjectFiles(newFiles)
                console.log(newFiles)
                console.log(`Double AB: ${currentPageIndex}:${currentPageIndex + 1}`)
            } else {
                alert("There is no page after this")
            }
        } catch (e) {
            alert("Function markPageAsDouble")
            alert(e)
        }
    }


    const saveFile = async () => {
        try {
            const exportFolder = await fs.getEntryWithUrl(directories.exportDir)
            const saveName = `${currentPageName}${files[currentPageIndex].isDouble}.psd`
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
            alert("Function saveFile")
            alert(e)
        }
    }

    const setNewPageNum = (newPageNum) => {
        // get page number selected.
        // get difference of new number to the original. Update all other pages by this amount as well to keep consistency
        try {
            const wantedPageNum = parseInt(newPageNum)
            console.log(`Wanted page num: ${wantedPageNum}`)
            if (wantedPageNum == NaN) {
                return
            }
            const pageNumDifference = wantedPageNum - pageNumber
            console.log(`Difference to current page number: `)
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
            getPageName(updatedPage)
            console.log(newFiles)
            console.log("Updated page numbers on current and further files")
        } catch (e) {
            alert("Function setNewPageNum")
            alert(e)
        }
    }

    const closeOverwriteDialog = async () => {
        try {
            overwriteAlert.close()
        } catch (e) {
            alert("Function close overwrite dialog")
            alert(e)
        }
    }


    const closeProjectDialog = async () => {
        try {
            projectDialog.close()
        } catch (e) {
            alert("Function close Project dialog")
            alert(e)
        }
    }

    const fileExists = async (file) => {
        try {
            console.log(file)
            const entry = await fs.getEntryWithUrl(`${file}`)
            console.log(entry)
            await entry.getMetadata()
            return true
        } catch(e) {
            return false
        }
    }
    const overwriteCheck = async () => {
        try {
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
        } catch(e) {
            alert("Function overwriteCheck")
            alert(e)
        }
    }
    const overwriteFile = async () => {
        try {
            await closeOverwriteDialog()
            await saveFile()
        } catch(e) {
            alert("Function overwriteFile")
            alert(e)
        }
    }
    const openOverwriteDialog = async () => {
        try {
            if (!overwriteAlert) {
                overwriteAlert = document.createElement("dialog")
                overwriteAlert.style.padding = "1rem"

                const root = createRoot(overwriteAlert)
                root.render(<OverwriteModal dialog={overwriteAlert} handleClose={closeOverwriteDialog} fileToOverwriteName={currentPageName} overwriteFile={overwriteFile}/>)
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
            alert("Function openOverwriteDialog")
            alert(e)
        }
    }


    const openProjectDialog = async () => {
        try {
            if (!projectDialog) {
                projectDialog = document.createElement("dialog")
                projectDialog.style.padding = "1rem"

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
            alert("Function openOverwriteDialog")
            alert(e)
        }
    }

    const savePSD = async (entry) => {
        console.log("Saving as psd")
        const doc = app.activeDocument
        try {
            doc.saveAs.psd(entry)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    const getPresetFileContents = async () => {
        try {
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
            alert("Function load preset")
            alert(e)
        }
    }
    const writeToPresetFile = async (content) => {
        try {
            const dataFolder = await fs.getDataFolder()
            const file = await dataFolder.getEntry(presetFileName)
            await file.write(content)
            console.log('Successfully written new preset')
        } catch (e) {
            alert("Function add to preset file")
            alert(e)
        }
    }

    const removeProject = async (inputVal) => {
        try {
            const newProjects = {}
            for (let i = 0; i < presets.length; i++) {
                if (presets[i] != inputVal) {
                    newProjects[presets[i]] = projects[presets[i]]
                }
            }
            const newPresets = presets.filter((item)=> {
                return item != inputVal
            })
            setProjects(newProjects)
            setPresets(newPresets)

            console.log("Setting value back")
            document.getElementById("saved-projects").selectedIndex = -1
        } catch(e) {
            alert("Function remove Project")
            alert(e)
        }
    }

    const saveProject = async (inputVal) => {
        try {

            const newProjects = await getPresetFileContents()
            newProjects[inputVal] = files
            setPresets(Object.keys(newProjects))
            setProjects(newProjects)
            console.log(newProjects)
            await writeToPresetFile(JSON.stringify(newProjects))
            await closeProjectDialog()
        } catch (e) {
            alert("Function save Project")
            alert(e)
        }
    }

    const loadProject = async (projectName) => {
        try {
            console.log("Before presetLoading")
            const projectContents = await getPresetFileContents()
            console.log("Before selecting projct")
            const selectedProject = projectContents[projectName]
            setProjectFiles(selectedProject)
            dispatch(setFiles(selectedProject))
        } catch(e) {
            alert("Function loadProject")
            alert(e)
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
                                                            active={index == currentPageIndex} key={index} pageNum={file.pageNumber} goToFunc={goToFile}
                                                            ></FileObject>)}
                </div>
            </div>
            <div class={"fit-row-style"}>
                <sp-action-button style={{width: "20%"}} onClick={() => {goToNextFile(false)}}>{"<"}</sp-action-button>
                {isStart &&
                    <sp-action-button style={{width: "60%"}} onClick={() => {openStartingFile()}}>Start</sp-action-button>
                }
                {!isStart &&
                    <sp-action-button style={{width: "60%"}} onClick={() => {changeFileStatus(currentPageIndex)}}>Complete</sp-action-button>
                }
                <sp-action-button style={{width: "20%"}} onClick={() => {goToNextFile(true)}}>{">"}</sp-action-button>
            </div>
            <div class={"fit-row-style"}>
                <sp-action-button style={{width: "50%"}} onClick={() => {markPageAsDouble()}}>Double</sp-action-button>
                <sp-action-button style={{width: "50%"}} onClick={() => {overwriteCheck()}}>Save</sp-action-button>
            </div>
        </Section>

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"} id={"page-number-input"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
            <sp-action-button class={"button-100"} onClick={() => {setNewPageNum(document.getElementById("page-number-input").value)}}>Set</sp-action-button>
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
            <div class={"fit-row-style heading-style"}>
                <sp-action-button style={{width: "50%"}} onClick={() => {removeProject(document.getElementById("saved-projects").value)}}>Remove</sp-action-button>
                <sp-action-button style={{width: "50%"}} onClick={() => loadProject(document.getElementById("saved-projects").value)}>Load</sp-action-button>
            </div>
            <sp-action-button class={"button-100"} onClick={() => {openProjectDialog()}}>Save</sp-action-button>
        </Section>

    </div>
}