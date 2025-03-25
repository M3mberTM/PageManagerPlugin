import React from "react";
import "./CommonStyles.css";
export const  ConvertModal = ({dialog, handleClose}) => {


    return (
        <div id={"convert-modal"}>
            <sp-heading style={{marginTop: 0}} size={"S"}>Converting project</sp-heading>
            <sp-heading size={"XS"}>Extension</sp-heading>
            <sp-dropdown class={"button-100"} placeholder={"Choose a selection..."}>
                <sp-menu slot={"options"}>
                    <sp-menu-item> PNG </sp-menu-item>
                    <sp-menu-item> JPG </sp-menu-item>
                </sp-menu>
            </sp-dropdown>
            <sp-heading size={"XS"}>Export folder</sp-heading>
            <sp-action-button class={"button-100"}>Pick export folder</sp-action-button>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={handleClose}>Cancel</sp-action-button>
                <sp-action-button onClick={handleClose}>Ok</sp-action-button>
            </div>
        </div>
    )

}