import React from "react";
import "../../CommonStyles.css";

export const OverwriteModal = ({dialog, overwriteFile, fileToOverwriteName, filePath}) => {

    const handleOverwriteFile = () => {
        dialog.close()
        overwriteFile(fileToOverwriteName, filePath).then()
    }

    return (
        <div style={{width: "400px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <sp-heading style={{marginTop: 0}}>You are about to overwrite a file</sp-heading>
                <sp-body>
                    The file you are about to save already exists ({fileToOverwriteName}). Do you want to overwrite it?
                </sp-body>
            </div>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={() => dialog.close()}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {handleOverwriteFile()}}>Ok</sp-action-button>
            </div>
        </div>
    )
}
