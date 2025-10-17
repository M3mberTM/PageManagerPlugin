import React from "react";
import {storage, versions, shell} from "uxp";
import os from "os";
import "./About.css"
import {ActionButton} from "../../components/typography/ActionButton";
import {action} from 'photoshop';

const fs = storage.localFileSystem;

export const About = ({dialog}) => {
    /*
    Information panel describing basic use of the plugin as well as who made it and some links to stuff
     */

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
            <sp-body style={{marginTop: "5px", marginBottom: "20px"}}>
                <span class={"italics strong-text"}>Greetings,</span>
                <br/>
                I am M3mber, the sole creator of this plugin.
                <br/>
                <br/>
                First of all, thanks for using my plugin. This plugin was created for 2 main reasons:<br/>
                - 1. Higher organization with naming<br/>
                - 2. Easier time moving between pages while editing or even typesetting
                <br/>
                <br/>
                I created the plugin to be as intuitive as possible, however, if you still don't understand something, you can check out the guide on github.
                <sp-link href={"https://github.com/M3mberTM/ReactPagePlugin"}>Repository</sp-link>
                <br/>
                <br/>
                    If you get an error, or something doesn't work as it should, you can message me. If you have github, you can create a new Issue underneath the
                repository. If you don't, that's also fine. Instead you can write me on Discord: <span class={"strong-text italics"}>m3mber</span>
            </sp-body>

            <sp-detail style={{fontSize:"15px"}}>PLUGIN DETAILS</sp-detail>
            <div class={"detailsSection"}>
                <div class={"pluginDetail"}>
                    <sp-detail class={"detailText"}>PLUGIN:</sp-detail>
                    <sp-body class={"detailValue"}>Beta {versions.plugin}</sp-body>
                </div>
                <div class={"pluginDetail"}>
                    <sp-detail class={"detailText"}>OPERATING SYSTEM:</sp-detail>
                    <sp-body class={"detailValue"}> {os.platform()} {os.release()}</sp-body>
                </div>
                <div class={"pluginDetail"}>
                    <sp-detail class={"detailText"}>UNIFIED EXTENSIBILITY PLATFORM:</sp-detail>
                    <sp-body class={"detailValue"}>{versions.uxp}</sp-body>
                </div>
            </div>

            <ActionButton classHandle={"button-100"} style={{marginTop: "5px"}} clickHandler={openDataFolder} isDisabled={false}>Open Data Folder</ActionButton>
            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} style={{marginLeft: "auto"}} autofocus="autofocus" variant="primary" onClick={() => dialog.close()}>Close</sp-button>
            </sp-button-group>
        </div>
    );
}
