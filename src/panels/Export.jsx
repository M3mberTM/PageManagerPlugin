import React, {useEffect, useRef} from 'react';
import {Section} from "../components/Section";
import {useState} from "react";
import "./Export.css";
import "../components/CommonStyles.css";
import {FileObject} from "../components/FileObject";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";
import {createRoot} from "react-dom";
import {OverwriteModal} from "../components/OverwriteModal";

const fs = require('uxp').storage.localFileSystem;
const core = require('photoshop').core
const app = require("photoshop").app;

export const Export = () => {
    const [exportExtension, setExportExtension] = useState('psd')
    const [files, setFiles] = useState([])
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
    const [showOverwritingAlert, setShowOverWritingAlert] = useState(false)
    let overwriteAlert = null
    const dispatch = useDispatch()

    useEffect(() => {
        // sorts the files in the same way as the file explorer does
        const loadedFiles = [...dirFiles]
        const collator = new Intl.Collator('en', {numeric: true, sensitivity: "base"})
        const sortedFiles = loadedFiles.sort((a, b) => collator.compare(a.name, b.name))
        setFiles(sortedFiles)
        setCurrentPageIndex(0)
        setPageNumber(0)
        setIsStart(true)
    }, [dirFiles])

    useEffect(() => {
        if (files.length > 0) {
            getPageName(currentPageIndex)
        }
    }, [namingTemplate])

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
    const openFile = async (pageNum) => {
        try {
            const app = window.require("photoshop").app
            const fileEntry = await fs.getEntryWithUrl(files[pageNum].filename)
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
                    getPageName(current + 1)
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
                    getPageName(current - 1)
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
            setFiles(newFiles)

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
                getPageName(0)
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

    const getPageName = (pageIndex) => {
        try {
            const currentPage = files[pageIndex]
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
                setFiles(newFiles)
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
            const entry = await exportFolder.createFile(`${currentPageName}${files[currentPageIndex].isDouble}.${exportExtension}`, {overwrite: true})
            const isSaved = await require('photoshop').core.executeAsModal(savePSD.bind(null, entry))
            if (isSaved) {
                console.log("Successfully saved")
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
            const newFiles = files.map((item) => {
                if (item.id >= files[currentPageIndex].id) {
                    return {...item, pageNumber: item.pageNumber + pageNumDifference}
                } else {
                    return item
                }
            })
            setPageNumber(pageNumber + pageNumDifference)
            setFiles(newFiles)
            getPageName(currentPageIndex)
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
            alert("Function close guide dialog")
            alert(e)
        }
    }

    const fileExists = async (file) => {
        try {
            console.log(file)
            const entry = await fs.getEntryWithUrl(`${file}.psd`)
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

            const currentFile = `${directories.exportDir}\\${currentPageName}`
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
            <div class={"fit-row-style heading-style"}>
                <sp-action-button style={{width: "50%"}}>Load</sp-action-button>
                <sp-action-button style={{width: "50%"}}>Remove</sp-action-button>
            </div>
            <sp-action-button class={"button-100"}>Save</sp-action-button>
        </Section>

    </div>
}