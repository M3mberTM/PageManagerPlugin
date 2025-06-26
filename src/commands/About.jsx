import React from "react";
import { storage, versions} from "uxp";
import os from "os";
import "../components/CommonStyles.css"
import {ActionButton} from "../components/ActionButton";

const fs = storage.localFileSystem;
const shell = require('uxp').shell
export const About = ({dialog}) => {

    const openDataFolder = async () => {
        try {
            const dataFolder = await fs.getDataFolder()
            console.log(dataFolder.nativePath)
            await shell.openPath(dataFolder.nativePath)
        } catch (e) {
           console.log(e)
        }
    }

    return (
        <div>
            <sp-heading>Page Manager Information</sp-heading>
            <sp-divider size="large"></sp-divider>
            <sp-body>
                Greetings,
                I am M3mber, creator of this plugin. This plugin was made for the main purpose of using it in scanlation to improve the speed and organization
                of working for any individual. I am sure the plugin might seem very daunting at first, however it should be simple to learn. If you want more
                information about the plugin, how to use it, next updates and other, check my github: <sp-link href={"https://github.com/M3mberTM/ReactPagePlugin"}>Repository</sp-link>
            </sp-body>
            <sp-body>
                In case of an error in the plugin, it is recommended to notify me, the creator so I can fix the issue in the next version of the plugin. You can
                do this in a number of ways. First, if you have a github account, you can make an Issue underneath my repository for this plugin. If you don't,
                don't fret, you can also contact me on discord:
                <span class={"strong-text"}>m3mber</span>
            </sp-body>
            <sp-detail>PLUGIN DETAILS</sp-detail>
            <div class={"fit-row-style unimportant-button"}>
                <div class={"row-highlight-style"}><sp-detail class={"zeroBMargin"} style={{paddingTop: "5px"}}>PLUGIN: </sp-detail><sp-body class={"zeroBMargin"}>Beta {versions.plugin}</sp-body></div>
                <div class={"row-highlight-style"}><sp-detail class={"zeroBMargin"} style={{paddingTop: "5px"}}>OPERATING SYSTEM:</sp-detail><sp-body class={"zeroBMargin"}> {os.platform()} {os.release()}</sp-body></div>
                <div class={"row-highlight-style"}><sp-detail class={"zeroBMargin"} style={{paddingTop: "5px"}}>UNIFIED EXTENSIBILITY PLATFORM:</sp-detail><sp-body class={"zeroBMargin"}>{versions.uxp}</sp-body></div>
            </div>
            <ActionButton classHandle={"button-100"}  style={{marginTop: "5px"}} clickHandler={openDataFolder} isDisabled={false}>Open Data Folder</ActionButton>
            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} style={{marginLeft: "auto"}} autofocus="autofocus" variant="primary" onClick={() => dialog.close()}>Close</sp-button>
            </sp-button-group>
        </div>
    );
}
