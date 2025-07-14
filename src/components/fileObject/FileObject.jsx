import React from 'react';
import "../../CommonStyles.css"

export const FileObject = ({name, pageNum, active, scrollRef, status, clickHandler, doubleClickHandler, pageIndex}) => {

    const isFinished = status ? 'completed-file' : 'inactive-file'
    const fileStatus = active ? 'active-file' : isFinished

    return <div class={fileStatus} style={{display: "flex", fontSize: "11px"}} ref={scrollRef} onClick={(event) => clickHandler(event, pageIndex)}
                onDoubleClick={() => doubleClickHandler(pageIndex)}>
        <div style={{flexBasis: "20px", textAlign: "center"}}>
            {pageNum}.
        </div>
        <div>
            {name}
        </div>
    </div>
}
