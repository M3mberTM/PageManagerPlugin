import React from "react";

import "../components/CommonStyles.css"
import {ActionButton} from "./ActionButton";
import {HighlightButton} from "./HighlightButton";

export const SettingOption = ({children, isEnabled, setter}) => {
    if (isEnabled) {
        return (
            <div style={{display: "flex"}}>
                <div>
                    <sp-body style={{fontWeight: "bold"}}>{children}</sp-body>
                </div>
                <div style={{marginLeft: "auto", width: "150px"}}>
                    <ActionButton style={{marginRight: "3px"}} clickHandler={() => setter(false)}>Disabled</ActionButton>
                    <HighlightButton></HighlightButton>
                </div>
            </div>
        )
    }
    return (
        <div style={{display: "flex"}}>
            <div>
                <sp-body style={{fontWeight: "bold"}}>{children}</sp-body>
                <sp-body size={"S"} style={{fontStyle: "italic"}}>Dummy text</sp-body>
            </div>
            <div style={{marginLeft: "auto", width: "150px"}}>
                <HighlightButton style={{marginRight: "3px"}}>Disabled</HighlightButton>
                <ActionButton clickHandler={() => setter(true)}>Enabled</ActionButton>
            </div>
        </div>
    );
}
