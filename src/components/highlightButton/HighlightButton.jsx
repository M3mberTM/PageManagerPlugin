import React from "react";

import "../../CommonStyles.css"

export const HighlightButton = ({style, clickHandler, children, classHandle, isDisabled}) => {
    if (isDisabled) {
        return <sp-action-button style={style} class={`${classHandle} unimportant-button-disabled`} disabled>{children}</sp-action-button>
    }
    return (
        <sp-action-button style={style} class={`${classHandle} unimportant-button`} onClick={clickHandler}>{children}</sp-action-button>
    );
}
