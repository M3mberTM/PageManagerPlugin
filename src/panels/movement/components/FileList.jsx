import React, {useRef} from "react";
import {FileObject} from "./FileObject";
import {logDecorator, syncLogDecorator} from "../../../utils/Logger";

export const FileList = ({files, currentPageIndex, goToPage, scrollRef, removePage}) => {

    const isDoubleClickDisabled = useRef(false)
    const fileDoubleClickHandler = logDecorator(async function fileDoubleClickHandler(fileIndex) {
        // if the click functionality is done, ignore so that two functions aren't done at the same time
        if (!isDoubleClickDisabled.current) {
            await goToPage(fileIndex)
        }
    })

    const fileClickHandler = syncLogDecorator(function fileClickHandler(event, fileIndex) {
        const isCtrlPressed = event.metaKey || event.ctrlKey
        if (isCtrlPressed) {
            // This is the worst solution I could have possible come up with but it works and that's what matters
            isDoubleClickDisabled.current = true
            removePage(fileIndex)
            setTimeout(() => isDoubleClickDisabled.current = false, 100)

        }
    })

    return (
        <div id={"files"}>
            {files.map((file, index) => <FileObject scrollRef={index === currentPageIndex ? scrollRef : undefined} name={file.name}
                                                          status={file.isDone}
                                                          doubleClickHandler={fileDoubleClickHandler}
                                                          active={index === currentPageIndex} key={index} pageNum={file.pageNumber}
                                                          clickHandler={fileClickHandler} pageIndex={index}
            ></FileObject>)}
        </div>
    )
}