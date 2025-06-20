import React from "react";

import "../components/CommonStyles.css"
import {ActionButton} from "./ActionButton";
import {HighlightButton} from "./HighlightButton";

export const SettingOption = ({children, isEnabled, setter, description, settingId}) => {
    if (isEnabled) {
        return (
            <div style={{display: "flex"}}>
                <div style={{paddingRight: "5px", width: "350px"}}>
                    <sp-body style={{fontWeight: "bold", marginBottom: "0px"}}>{children}</sp-body>
                    <sp-body size={"S"} style={{fontStyle: "italic"}}>{description}</sp-body>
                </div>
                <div style={{marginLeft: "auto", width: "200px"}}>
                    <ActionButton style={{marginRight: "3px"}} clickHandler={() => setter(settingId, false)}>Disabled</ActionButton>
                    <HighlightButton>Enabled</HighlightButton>
                </div>
            </div>
        )
    }
    return (
        <div style={{display: "flex"}}>
            <div style={{paddingRight: "5px", width: "350px"}}>
                <sp-body style={{fontWeight: "bold", marginBottom: "0px"}}>{children}</sp-body>
                <sp-body size={"S"} style={{fontStyle: "italic"}}>{description}</sp-body>
            </div>
            <div style={{marginLeft: "auto", width: "200px"}}>
                <HighlightButton style={{marginRight: "3px"}}>Disabled</HighlightButton>
                <ActionButton clickHandler={() => setter(settingId, true)}>Enabled</ActionButton>
            </div>
        </div>
    );
}
