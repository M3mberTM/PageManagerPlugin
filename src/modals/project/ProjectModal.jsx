import React from "react";
import "../../CommonStyles.css";

export const ProjectModal = ({dialog, files, saveProject}) => {

    const validateAndSend = () => {
        const input = document.getElementById("project-name").value
        if  (input.length < 1) {
            alert("No name was inputted")
            return
        }
        dialog.close()
        saveProject(input)
    }

    return (
        <div style={{width: "400px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <sp-heading style={{marginTop: 0}}>Saving a project</sp-heading>
                <sp-body>
                    You are about to save a project. Fill in the name and confirm that the files shown are all the things you want to save!
                </sp-body>
            </div>
            <div>
                <sp-textfield placeholder="Project Name" id={"project-name"}>
                    <sp-label isrequired="true" slot="label">Project name</sp-label>
                </sp-textfield>
            </div>
            <div class={"files"}>
                {files.map((item, index)=> {
                    return <div key={index}> {item.pageNumber}.{item.name}</div>
                })}
            </div>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={() => dialog.close()}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {validateAndSend()}}>Ok</sp-action-button>
            </div>
        </div>
    )
}
