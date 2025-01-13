import React from 'react';
import "./FileObject.css"

export const FileObject = ({name, status, active,  changeStatus, scrollRef}) => {

    return <div className={active ? "active-file" : "inactive-file"} ref={scrollRef}>
        <label>{name} <input type={"checkbox"} className={"file-checkbox"} checked={status} onChange={changeStatus}/></label>
    </div>
}
