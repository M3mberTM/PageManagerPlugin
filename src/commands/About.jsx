import React from "react";

import { versions } from "uxp";
import os from "os";

import "../components/CommonStyles.css"

export const About = ({dialog}) => {
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
                <div class={"row-highlight-style"}><sp-detail>PLUGIN: </sp-detail><sp-body>Beta {versions.plugin}</sp-body></div>
                <div class={"row-highlight-style"}><sp-detail>OPERATING SYSTEM:</sp-detail><sp-body> {os.platform()} {os.release()}</sp-body></div>
                <div class={"row-highlight-style"}><sp-detail>UNIFIED EXTENSIBILITY PLATFORM:</sp-detail><sp-body>{versions.uxp}</sp-body></div>
            </div>
            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} variant="secondary" quiet="quiet" onClick={() => dialog.close("reasonCanceled")}>Cancel</sp-button>
                <sp-button tabindex={0} autofocus="autofocus" variant="primary" onClick={() => dialog.close("ok")}>OK</sp-button>
            </sp-button-group>
        </div>
    );
}
