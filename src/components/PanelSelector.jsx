import React, {useState} from 'react';
import {Import} from "../panels/Import";
import {Naming} from "../panels/Naming";
import {Export} from "../panels/Export";

export const PanelSelector = ({panel}) => {

    const [nameTemplate, setNameTemplate] = useState("")
    const [files, setFiles] = useState([])
    if (panel === 0) {
        return <div className={"panel"}>
            <Import/>
        </div>
    } else if (panel === 1) {
        return <div className={"panel"}>
            <Naming setNameTemplate={setNameTemplate}/>
        </div>
    } else if (panel === 2) {
        return <div className={"panel"}>
            <Export nameTemplate={nameTemplate} files={files}/>
        </div>
    } else
        return <></>
}