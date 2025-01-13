import React, {useEffect, useRef} from 'react';
import {useState} from "react";
import "./Export.css"
import {FileObject} from "../components/FileObject";
import {useSelector} from "react-redux";

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
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    const getPageName = (pageNum) => {
        const currentPage = files[pageNum]
        if (namingTemplate.length < 1) {
            const finalName = currentPage.name.replace(/\.[\w\d]+$/, "")
            setCurrentPageName(finalName)
            return
        }
        const originalNameAppend = namingTemplate.replaceAll("%og%", currentPage.name)
        const fileNumberAppend = originalNameAppend.replaceAll("%num%", String(pageNum))
        const leadingZerosPattern = /%a\d+%/
        let leadingZerosAppend = fileNumberAppend
        while (leadingZerosPattern.test(leadingZerosAppend)) {
            const match = leadingZerosPattern.exec(leadingZerosAppend)['0']
            const padLength = parseInt(match.substring(2, match.length - 1))
            const paddedNum = addLeadingZeros(pageNumber, padLength)
            leadingZerosAppend = leadingZerosAppend.replaceAll(match, paddedNum)
        }
        const finalName = leadingZerosAppend.replace(/\.[\w\d]+$/, "")
        setCurrentPageName(finalName)
    }

    const getOverwriteCheck = async () => {
        console.log(confirm("Do you want to overwrite"))
        console.log(await fs.getDataFolder())
    }


    const saveFile = () => {

    }


    return <div id={"export"}>
        {/*Heading*/}
        <sp-heading size={"L"}>Export</sp-heading>
        <sp-divider size="small"></sp-divider>
        {/*List of files to finish.*/}
        <sp-progressbar max={files.length} value={completedNum}>
            <sp-label slot={"label"} size={"small"}>Progress:</sp-label>
        </sp-progressbar>
        <div id={"files"}>
            {files.map((file, index) => <FileObject scrollRef={index == currentPageIndex ? scrollRef : undefined} name={file.name} status={file.isDone}
                                                    active={index == currentPageIndex} key={index}
                                                    changeStatus={() => changeFileStatus(index)}>{file.name}</FileObject>)}
        </div>
        {/*Information about saving*/}
        <sp-heading size={"S"}>Additional settings</sp-heading>
        <sp-label slot={"label"} className={"input-label"} for={"page-num"}>Manual page number</sp-label>
        <input type={"number"} name={"page-num"} style={{width: "40px"}}/>
        <sp-action-button onClick={() => getOverwriteCheck()}>Set</sp-action-button>
        <sp-heading size={"S"}>Name for saving</sp-heading>
        <sp-body>{files.length < 1 ? "FileName" : currentPageName}</sp-body>
        <select name={"extensions"} value={exportExtension} onChange={(e) => setExportExtension(e.target.value)}>
            <option value={"psd"}>psd</option>
            <option value={"png"}>png</option>
            <option value={"jpg"}>jpg</option>
        </select>
        {/*Movement between pages*/}
        <sp-heading size={"S"}>Movement</sp-heading>
        {isStart &&
            <sp-action-button onClick={() => openStartingFile()}>Start</sp-action-button>
        }
        {!isStart &&
            <div>
                <sp-action-button onClick={() => goToNextFile(false)}>Before</sp-action-button>
                {directories.shouldExport != null ? (
                    <sp-action-button onClick={() => console.log("Save")}>Save</sp-action-button>
                ) : (
                    <sp-action-button disabled>Save</sp-action-button>
                )}
                <sp-action-button onClick={() => goToNextFile(true)}>After</sp-action-button>
            </div>
        }
        <br/>
        {/*Completion*/}
        <sp-button variant={"cta"} onClick={() => changeFileStatus(currentPageIndex)}>Complete page</sp-button>
        {showOverwritingAlert &&
            <sp-action-button onClick={() => console.log("Button clicked")}>Ok</sp-action-button>
        }
    </div>
}