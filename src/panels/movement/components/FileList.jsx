import React from "react";
import {FileObject} from "./FileObject";

export const FileList = ({files, currentPageIndex, fileClickHandler, fileDoubleClickHandler}) => {

    return (
        <div id={"files"}>
            {files.map((file, index) => <FileObject scrollRef={index === currentPageIndex.current ? scrollRef : undefined} name={file.name}
                                                          status={file.isDone}
                                                          doubleClickHandler={fileDoubleClickHandler}
                                                          active={index === currentPageIndex.current} key={index} pageNum={file.pageNumber}
                                                          clickHandler={fileClickHandler} pageIndex={index}
            ></FileObject>)}
        </div>
    )
}