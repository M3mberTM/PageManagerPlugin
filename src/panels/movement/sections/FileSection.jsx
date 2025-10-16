import React, {useRef} from "react";
import {Section} from "../../../components/section/Section";
import {HighlightButton} from "../../../components/typography/HighlightButton";
import {useDispatch, useSelector} from "react-redux";
import {MovementControls} from "../components/MovementControls";
import {FileList} from "../components/FileList";
import {logDecorator, syncLogDecorator} from "../../../utils/Logger";
import {app, core} from 'photoshop';
import {storage} from 'uxp';
import {setCurrentIndex} from "../../../redux/pageSlice";
import {setIsStart} from "../../../redux/utilsSlice";
import {removeFile, setFiles} from "../../../redux/fileSystemSlice";
import {PATH_DELIMITER} from "../../../utils/constants";
import {entryExists, spawnDialog} from "../../../utils/helper";
import {OverwriteModal} from "../../../modals/overwrite/OverwriteModal";

const fs = storage.localFileSystem;

export const FileSection = ({getPageName}) => {
    const dispatch = useDispatch()
    const utilSlice = useSelector(state => state.utils)
    const fsSlice = useSelector(state => state.fileSystem)
    const pgSlice = useSelector(state => state.pages)

    const isStart = utilSlice.isStart
    const isFocused = utilSlice.isFocused
    const loadedFiles = fsSlice.files
    const currentIndex = pgSlice.currentIndex
    const shouldExport = fsSlice.shouldExport
    const exportDir = fsSlice.exportDir

    const scrollRef = useRef()
    const isLoadingFile = useRef(false)
    const currentDoc = useRef(undefined)
    const previousDoc = useRef(undefined)

    const elementScrollToView = syncLogDecorator(function elementScrollToView() {
        // noinspection JSUnresolvedReference
        scrollRef.current.scrollIntoView({behavior: 'smooth'})
    })

    const openDocument = logDecorator(async function openDocument(entry) {
        let document
        await core.executeAsModal(async () => document = await app.open(entry))
        return document
    })

    const closeDocument = logDecorator(async function closeDocument(document) {
        // noinspection JSUnresolvedReference
        await core.executeAsModal(async () => await document.close())
    })

    const goToPage = logDecorator(async function goToPage(pageIndex) {
        if (loadedFiles.length < 1) {
            alert('No files are loaded')
            return
        }
        if (!isLoadingFile.current) {
            isLoadingFile.current = true
            let fileEntry
            let isExported = false
            console.log('opening entry: ', loadedFiles[pageIndex])
            if (loadedFiles[pageIndex].exportPath.length > 1) {
                fileEntry = await fs.getEntryWithUrl(loadedFiles[pageIndex].exportPath)
                isExported = true
            } else {
                fileEntry = await fs.getEntryWithUrl(loadedFiles[pageIndex].filePath)
            }
            previousDoc.current = currentDoc.current
            currentDoc.current = await openDocument(fileEntry)
            console.log("Opened document: ", currentDoc.current)
            dispatch(setCurrentIndex(pageIndex))
            console.log('pageIndex: ', pageIndex)
            if (shouldExport && !isExported) {
                await savePage(pageIndex)
            }
            if (isStart) {
                dispatch(setIsStart(false))
            }
            if (previousDoc.current) {
                await closeDocument(previousDoc.current)
            }

            elementScrollToView()
            isLoadingFile.current = false
        }
    })

    const removePage = syncLogDecorator(function removePage(pageIndex) {
        console.log('Removing file: ', loadedFiles[pageIndex])
        dispatch(removeFile(loadedFiles[pageIndex].id))
    })

    const savePage = logDecorator(async function savePage(index) {
        if (!shouldExport) {
            alert('Enable Export in the Import Panel')
            return
        }
        if (exportDir.length < 1) {
            alert('No export folder was selected')
            return
        }
        const pageName = getPageName(loadedFiles[index])
        const filePath = `${exportDir}${PATH_DELIMITER}${pageName}.psd`
        console.log('Saving as: ', filePath)
        if (await entryExists(filePath)) {
            console.log('file exists already')
            await spawnDialog(<OverwriteModal overwriteFile={overwriteFile} fileToOverwriteName={pageName} filePath={filePath}/> )
        } else {
            const isSaved = await saveAsPSD(pageName)
            if (!isSaved) {
                alert(`Something went wrong and your file isn't saved`)
            } else {
                const page = loadedFiles[index]
                const updatedPage = {...page, exportPath: filePath}
                const updatedFiles = loadedFiles.map((file) => {
                    if (file.id === updatedPage.id) {
                        return updatedPage
                    }
                    return file
                })
                dispatch(setFiles(updatedFiles))
            }
        }
    })

    const overwriteFile = logDecorator(async function overwriteFile(pageName, filePath) {
        const isSaved = await saveAsPSD(pageName)
        if (!isSaved) {
            alert(`Something went wrong and your file isn't saved`)
        } else {
            const page = loadedFiles[currentIndex]
            const updatedPage = {...page, exportPath: filePath}
            const updatedFiles = loadedFiles.map((file) => {
                if (file.id === updatedPage.id) {
                    return updatedPage
                }
                return file
            })
            dispatch(setFiles(updatedFiles))
        }
    })

    const saveAsPSD = logDecorator(async function saveAsPSD(pageName) {
        const exportFolder = await fs.getEntryWithUrl(exportDir)
        const saveName = `${pageName}.psd`
        const entry = await exportFolder.createFile(saveName, {overwrite: true})
        await core.executeAsModal(async () => {
            await currentDoc.current.saveAs.psd(entry)
        })
        return true
    })

    const goNextPage = logDecorator(async function goNextPage(isForward) {
        if (isForward && currentIndex > loadedFiles.length - 2) {
            alert('There is no file after this')
        } else if (!isForward && currentIndex < 1) {
            alert('There is no file before this')
        } else {
            if (isForward) {
                await goToPage(currentIndex + 1)
            } else {
                await goToPage(currentIndex - 1)
            }
        }
    })

    const changeCurrentPageStatus = syncLogDecorator(function changeCurrentPageStatus() {
        const page = loadedFiles[currentIndex]
        console.log('Changing status: ', page)
        const updatedPage = {...page, isDone: !page.isDone}
        const newFiles = loadedFiles.map((file) => {
            if (file.id === updatedPage.id) {
                return updatedPage
            }
            return file
        })
        dispatch(setFiles(newFiles))
    })

    const completedFilesNum = loadedFiles.length < 1 ? 0 : loadedFiles.filter((file) => file.isDone).length
    return (
        <Section sectionName={"Files"} isTransparent={true}>
            <div>
                <sp-progressbar max={loadedFiles.length} value={completedFilesNum} style={{width: "100%"}}>
                    <sp-label slot={"label"} size={"small"}>Progress:</sp-label>
                </sp-progressbar>
                <FileList files={loadedFiles} currentPageIndex={currentIndex} goToPage={goToPage} scrollRef={scrollRef} removePage={removePage}/>
            </div>
            <MovementControls isFocused={isFocused} isStart={isStart} goToPage={goToPage} goNextPage={goNextPage} changeCurrentPageStatus={changeCurrentPageStatus}/>
            <div class={"fit-row-style"}>
                <HighlightButton classHandle={"unimportant-button button-100"} clickHandler={() => {
                    savePage(currentIndex).then()
                }} isDisabled={isStart || !isFocused}>Save
                </HighlightButton>
            </div>
        </Section>
    )
}