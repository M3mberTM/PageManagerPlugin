import React from "react";
import {ActionButton} from "../../../components/typography/ActionButton";
import {HighlightButton} from "../../../components/typography/HighlightButton";

export const MovementControls = ({isStart, openStartingFile, goToNextFile, changeFileStatus, currentPageIndex, isFocused}) => {

    if (isStart) {
        // noinspection HtmlUnknownAttribute
        return (
            <div class={"fit-row-style"}>
                <ActionButton style={{width: "20%"}} isDisabled={isStart}>{"<"}</ActionButton>
                <HighlightButton classHandle={"unimportant-button"} style={{width: "60%"}} isDisabled={!isFocused} clickHandler={() => {
                    openStartingFile().then()
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
                    goToNextFile(false).then()
                }} isDisabled={isStart || !isFocused}>{"<"}</ActionButton>
                <ActionButton style={{width: "60%"}} clickHandler={() => {
                    changeFileStatus(currentPageIndex).then()
                }} isDisabled={isStart || !isFocused}>Complete
                </ActionButton>
                <ActionButton style={{width: "20%"}} clickHandler={() => {
                    goToNextFile(true).then()
                }} isDisabled={isStart || !isFocused}>{">"}</ActionButton>
            </div>
        )
    }
}