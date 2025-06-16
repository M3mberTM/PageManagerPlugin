import React from "react";

import "../components/CommonStyles.css"
import {SettingOption} from "../components/SettingOption";
// TODO Finish this component

export const Settings = ({dialog}) => {
    return (
        <div>
            <sp-heading>Page Manager Settings</sp-heading>
            <sp-divider size="large"></sp-divider>
            <div style={{marginTop: "10px"}}>
                <SettingOption>Test option</SettingOption>
            </div>

            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} autofocus="autofocus" variant="primary" style={{marginLeft: "auto"}} onClick={() => dialog.close("ok")}>Close</sp-button>
            </sp-button-group>
        </div>
    );
}
