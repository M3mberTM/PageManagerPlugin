import React from "react";
import "./CommonStyles.css";

export const GuideModal = ({dialog, handleClose}) => {

    return (
        <div style={{width: "400px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <sp-heading style={{marginTop: 0}}>Simple guide for Template making</sp-heading>
                <sp-body>
                    Not sure how to make a template or even what a template is? I'm here to help. Templates are a piece of text that allow the plugin to save files
                    using a naming scheme. This means that each file will look similar, however it will have small changes between each individual files. For example
                    page numbers. They change for each file, however the series name stays the same. Templates allow you make such simple changes between files
                    without having to write all of the file names individually. Now, let's go over some of the main functions and how they work. Don't feel afraid
                    to play around setting different templates before deciding on the final one.
                    <span class={"strong-text"}>
                        Keep in mind that not using any functions may result in files that overwrite each other when saved as they will end up with the same names!!!
                    </span>
                    <br/>
                    <br/>
                    Each template function is surrounded by percentage signs (%) so that the plugin knows it is a function. Below are the possible functions you can
                    call at this moment!

                </sp-body>
                <br/>
                <div class={"table-style"}>
                    <div class={"row-header-style"}>
                        <sp-heading size={"XS"} class={"col-style text-center col-right-border width-50"}>Command</sp-heading>
                        <sp-heading size={"XS"} class={"col-style text-center width-50"}>Explanation</sp-heading>
                    </div>
                    <div class={"row-style"}>
                        <sp-body class={"col-style col-right-border width-50"}>og</sp-body>
                        <sp-body class={"col-style width-50 left-pad"}>Takes the original file name</sp-body>
                    </div>
                    <div class={"row-style"}>
                        <sp-body class={"col-style col-right-border width-50"}>num</sp-body>
                        <sp-body class={"col-style width-50 left-pad"}>Writes the page number (Page numbers start at 1 from the first file in the folder. You can
                        adjust this in the movement tab though.</sp-body>
                    </div>
                    <div className={"row-style"}>
                        <sp-body class={"col-style col-right-border width-50"}>an</sp-body>
                        <sp-body class={"col-style width-50 left-pad"}>Writes the page number with leading zeros (replace the character n with the number of
                            leading zeros you want in the page number. Example. a3 will give 001 for page number 1)
                        </sp-body>
                    </div>
                </div>
            </div>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={handleClose}>Close</sp-action-button>
            </div>
        </div>
    )
}