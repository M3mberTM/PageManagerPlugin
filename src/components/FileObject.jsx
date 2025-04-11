import React from 'react';
import "./FileObject.css"

export const FileObject = ({name,pageNum, active, scrollRef, status, goToFunc}) => {

    return <div class={active ? "active-file" : status ? "completed-file" : "inactive-file"} style={{display: "flex", justifyContent: "space-between", fontSize: "11px"}} ref={scrollRef}>
        <div style={{flexBasis: "20px", textAlign: "center"}}>
            {pageNum}.
        </div>
        <div>
            {name}
        </div>
        <div style={{flexBasis: "20px"}}>
            <sp-icon  size={"s"} name={"ui:ArrowLeftMedium"} onClick={() => {goToFunc(pageNum)}}></sp-icon>
        </div>
    </div>
}
