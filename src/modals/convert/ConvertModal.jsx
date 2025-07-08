import React from "react";
import "../../components/CommonStyles.css";
import {useState} from "react";
import {getTruncatedString} from "../../utils/helper";
import {storage} from 'uxp';

const fs = storage.localFileSystem;

// todo replace all sp-dropdown elements with sp-picker instead
export const ConvertModal = ({dialog, convertFiles}) => {
    const [extension, setExtension] = useState("")
    const [exportFolder, setExportFolder] = useState("")
    const [shownExportFolder, setShownExportFolder] = useState("")

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

    const validateAndSend = () => {
        if (exportFolder.length < 1 ) {
            alert("No folder selected")
            return
        }
        if (extension.length < 1) {
            alert("No extension selected")
            return
        }
        convertFiles(extension, exportFolder)
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
                <sp-action-button onClick={() => dialog.close()}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {validateAndSend()}}>Ok</sp-action-button>
            </div>
        </div>
    )

}