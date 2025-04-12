import React from "react";
import "./CommonStyles.css";

export const ProjectModal = ({dialog, handleClose, files, saveProject}) => {

    return (
        <div style={{width: "400px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <sp-heading style={{marginTop: 0}}>Saving a project</sp-heading>
                <sp-body>
                    You are about to save a project. Please fill in and confirm the information below!
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
                <sp-action-button onClick={handleClose}>Cancel</sp-action-button>
                <sp-action-button onClick={() => {saveProject(document.getElementById("project-name").value)}}>Ok</sp-action-button>
            </div>
        </div>
    )
}
