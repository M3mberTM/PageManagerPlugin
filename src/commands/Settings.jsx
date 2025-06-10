import React from "react";

import "../components/CommonStyles.css"
import {SettingOption} from "../components/SettingOption";
// TODO Finish this component

export const Settings = ({dialog}) => {
    return (
        <div>
            <sp-heading>Page Manager Settings</sp-heading>
            <sp-divider size="large"></sp-divider>
            <SettingOption>Test option</SettingOption>
            <sp-button-group style={{marginTop: "10px"}}>
                <sp-button tabindex={0} variant="secondary" quiet="quiet" onClick={() => dialog.close("reasonCanceled")}>Cancel</sp-button>
                <sp-button tabindex={0} autofocus="autofocus" variant="primary" onClick={() => dialog.close("ok")}>OK</sp-button>
            </sp-button-group>
        </div>
    );
}
