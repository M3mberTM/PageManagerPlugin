import React from 'react';
import "./CommonStyles.css"

export const FileObject = ({name,pageNum, active, scrollRef, status, goToFunc, pageIndex}) => {

    return <div class={active ? "active-file" : status ? "completed-file" : "inactive-file"} style={{display: "flex", fontSize: "11px"}} ref={scrollRef} onClick={() => goToFunc(pageIndex)}>
        <div style={{flexBasis: "20px", textAlign: "center"}}>
            {pageNum}.
        </div>
        <div>
            {name}
        </div>
    </div>
}
