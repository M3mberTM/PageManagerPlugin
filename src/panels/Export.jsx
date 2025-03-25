import React, {useEffect, useRef} from 'react';
import {Section} from "../components/Section";
import {useState} from "react";
import "./Export.css";
import "../components/CommonStyles.css";
import {FileObject} from "../components/FileObject";
import {useSelector} from "react-redux";
import {setFiles} from "../reducers/fileSlice"
import {useDispatch} from "react-redux";

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
    const [inputManualPageNum, setInputManualPageNum] = useState(0)
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
        scrollRef.current.scrollIntoView({behavior: 'smooth'})
    }
    const openFile = async (pageNum) => {
        const app = window.require("photoshop").app
        const fileEntry = await fs.getEntryWithUrl(files[pageNum].filename)
        await app.open(fileEntry)
    }

    const openNextFile = async (pageNum) => {
        try {
            await core.executeAsModal(() => openFile(pageNum))
        } catch (e) {
            console.log(e)
        }
    }

    const goToNextFile = async (isForward) => {
        try {
            const current = currentPageIndex
            const currentPageNum = pageNumber
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
                    getPageName(currentPageNum + 1)
                }
            } else {
                if (current != 0) {
                    setCurrentPageIndex(current - 1)
                    setPageNumber(currentPageNum - 1)
                    console.log(`Page number: ${currentPageNum - 1}`)
                    console.log(`Current page: ${current + 1}`)
                    await openNextFile(current - 1)
                    getPageName(currentPageNum - 1)
                }
            }
            elementScrollToView()
            await core.executeAsModal(() => closeFile(currentDoc))
            console.log("Closed the file")
        } catch (e) {
            console.log(e)
        }
    }

    const closeFile = async (document) => {
        try {
            await document.close()
        } catch (e) {
            console.log(e)
        }
    }

    const changeFileStatus = (index) => {
        const file = files[index]
        const newFile = {...file, isDone: !file.isDone}
        const newFiles = files.map((file, i) => {
            if (index == i) {
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
    }

    const openStartingFile = async () => {
        if (files.length > 0) {
            await openNextFile(0)
            setIsStart(false)
            getPageName(0)
        } else {
            alert("No files were loaded")
        }
    }

    const addLeadingZeros = (num, size) => {
        return String(num).padStart(size, '0')
    }

    const getPageName = (pageNum) => {
        const currentPage = files[pageNum]
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
    }

    const getOverwriteCheck = async () => {
        const currentPage = files[pageNum]
        const exportFolder = await fs.getEntryWithUrl(directories.exportDir)
        // when saving files, add the save path to the files array, for easier checking later
        // Save the whole path, and then just extract the filename from it after when checking
        console.log(confirm("Do you want to overwrite"))
        console.log(await fs.getDataFolder())
    }


    const saveFile = async () => {

        const exportFolder = await fs.getEntryWithUrl(directories.exportDir)
        const entry = await exportFolder.createFile(`${currentPageName}.${exportExtension}`, {overwrite: true})
        const isSaved = await require('photoshop').core.executeAsModal(savePSD.bind(null, entry))
        if (isSaved) {
            console.log("Successfully saved")
        }
    }

    const setNewPageNum = () => {
        // get page number selected.
        // Update the page number using dispatch
        // get difference of new number to the original. Update all other pages by this amount as well to keep consistency

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
                                                            active={index == currentPageIndex} key={index}
                                                            changeStatus={() => changeFileStatus(index)}>{file.name}</FileObject>)}
                </div>
            </div>
            <div class={"fit-row-style"}>
                <sp-action-button style={{width: "20%"}}>{"<"}</sp-action-button>
                <sp-action-button style={{width: "60%"}}>Complete</sp-action-button>
                <sp-action-button style={{width: "20%"}}>{">"}</sp-action-button>
            </div>
            <div class={"fit-row-style"}>
                <sp-action-button style={{width: "50%"}}>Save</sp-action-button>
                <sp-action-button style={{width: "50%"}}>Double</sp-action-button>
            </div>
        </Section>
        {/*Information about saving*/}
        {/*
        <div id={"export-movement"}>
            {isStart &&
                <sp-action-button onClick={() => openStartingFile()}>Start</sp-action-button>
            }
            {!isStart &&
                <div>
                    <sp-action-button onClick={() => goToNextFile(false)}>{"<"}</sp-action-button>
                    <sp-action-button>Double Spread</sp-action-button>
                    <sp-action-button onClick={() => changeFileStatus(currentPageIndex)}>Complete page</sp-action-button>
                    <sp-action-button onClick={() => goToNextFile(true)}>{">"}</sp-action-button>
                    <br/>
                    {directories.shouldExport != null ? (
                        <sp-action-button onClick={() => console.log("Tried to save")}>Save</sp-action-button>
                    ) : (
                        <sp-action-button disabled>Save</sp-action-button>
                    )}
                </div>
            }
        </div>
        */}

        <Section isTransparent={true} sectionName={"Additional information"}>
            <sp-textfield class={"button-100"}>
                <sp-label slot={"label"} isrequired={"true"}>Manual page number</sp-label>
            </sp-textfield>
            <sp-heading size={"XS"}>Current file name</sp-heading>
            <sp-heading size={"XXS"}>Placeholder filename</sp-heading>
        </Section>

        <Section isTransparent={true} sectionName={"project"}>
            <div class={"fit-row-style heading-style"}>
                <sp-action-button style={{width: "50%"}}>Load</sp-action-button>
                <sp-action-button style={{width: "50%"}}>Remove</sp-action-button>
            </div>
            <sp-action-button class={"button-100"}>Save</sp-action-button>
        </Section>

        {/*
        <sp-heading size={"M"}>Additional Information</sp-heading>
        <div className={"same-line"}>
        <p className={"input-label same-line-element"}>Manual page number</p>
        <input type={"number"} name={"page-num same-line-element"} style={{width: "40px"}} onChange={(e) => setInputManualPageNum(e.target.value)}/>
        <sp-action-button className={"same-line-element"} onClick={() => setNewPageNum()}>Set</sp-action-button>
        </div>
        <br/>
        <p className={"input-label"}>Name for saving</p>
        <sp-body>{files.length < 1 ? "FileName" : currentPageName}
            <select name={"extensions"} value={exportExtension} onChange={(e) => setExportExtension(e.target.value)}>
                <option value={"psd"}>psd</option>
                <option value={"png"}>png</option>
                <option value={"jpg"}>jpg</option>
            </select>
        </sp-body>
        */}
    </div>
}