import React from "react";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";

export const MovementControls = ({isStart, isFocused, goToPage, goNextPage, changeCurrentPageStatus}) => {

    if (isStart) {
        // noinspection HtmlUnknownAttribute
        return (
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "20%"}} isDisabled={isStart}>{"<"}</ActionButton>
                <HighlightButton classHandle={"unimportant-button"} style={{width: "60%"}} isDisabled={!isFocused} clickHandler={() => {
                    goToPage(0).then()
                }}>Start
                </HighlightButton>
                <ActionButton style={{width: "20%"}} isDisabled={isStart}>{">"}</ActionButton>
            </div>
        )
    } else {
        // noinspection HtmlUnknownAttribute
        return (
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "20%"}} clickHandler={() => {
                    goNextPage(false).then()
                }} isDisabled={isStart || !isFocused}>{"<"}</ActionButton>
                <ActionButton style={{width: "60%"}} clickHandler={() => {
                    changeCurrentPageStatus()
                }} isDisabled={isStart || !isFocused}>Complete
                </ActionButton>
                <ActionButton style={{width: "20%"}} clickHandler={() => {
                    goNextPage(true).then()
                }} isDisabled={isStart || !isFocused}>{">"}</ActionButton>
            </div>
        )
    }
}