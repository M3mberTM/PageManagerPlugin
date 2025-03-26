import React from "react";
import "./CommonStyles.css";
import {useState} from "react";
const fs = require('uxp').storage.localFileSystem;

export const  ConvertModal = ({dialog, handleClose, convert}) => {
    const [extension, setExtension] = useState("")
    const [exportFolder, setExportFolder] = useState("")
    const [shownExportFolder, setShownExportFolder] = useState("")

    const getTruncatedString = (maxLength, text) => {
        const actualLength = maxLength - 3
        const textLength = text.length
        if (textLength > actualLength) {
            return "..." + text.slice(textLength - actualLength, textLength)
        } else {
            return "..." + text
        }
    }
    const getFolder = async () => {
        console.log("Getting folder")
        const folder = await fs.getFolder();
        console.log(`Path to folder: ${fs.getNativePath(folder)}`)
        setExportFolder(folder.nativePath)
        setShownExportFolder(getTruncatedString(20, folder.nativePath))
    }

    const handleDropDownChange = (value) => {
        setExtension(value)
    }

    return (
        <div id={"convert-modal"}>
            <sp-heading style={{marginTop: 0}} size={"S"}>Converting project</sp-heading>
            <sp-heading size={"XS"}>Extension</sp-heading>
            <sp-dropdown style={{width: "150px"}} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"} onClick={(event) => {handleDropDownChange(event.target.value)}}>
                    <sp-menu-item value={"png"}> PNG </sp-menu-item>
                    <sp-menu-item value={"jpg"}> JPG </sp-menu-item>
                </sp-menu>
            </sp-dropdown>
            <sp-heading size={"XS"}>Export folder</sp-heading>
            <sp-body>{shownExportFolder.length < 1 ? "Folder path" : shownExportFolder}</sp-body>
            <sp-action-button class={"button-100"} onClick={getFolder}>Pick export folder</sp-action-button>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={handleClose}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {convert(extension, exportFolder)}}>Ok</sp-action-button>
            </div>
        </div>
    )

}