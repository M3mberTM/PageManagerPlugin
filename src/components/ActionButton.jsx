import React from "react";

import "../components/CommonStyles.css"

export const ActionButton = ({style, clickHandler, children, classHandle, isDisabled}) => {
    if (isDisabled) {
        return <sp-action-button style={style} class={classHandle} disabled>{children}</sp-action-button>
    }
    return (
        <sp-action-button style={style} class={classHandle} onClick={clickHandler}>{children}</sp-action-button>
    );
}
