import React from 'react';
import "../CommonStyles.css";
export const Section = ({children, isTransparent, bgColor, headingColor, sectionName}) => {
    const borderRadius = "3px";

    const sectionStyle = {
        backgroundColor: isTransparent ? "transparent" : bgColor,
        color: "white",
        borderRadius: borderRadius,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#3c3c3c",
        marginBottom: "5px",
    }

    const sectionHeading = {
        backgroundColor: isTransparent ? "#444444" : headingColor,
        borderRadius: borderRadius,
        display: "inline-block",
        borderTopRightRadius: "0px",
        borderBottomLeftRadius: "0px",
        paddingRight: "8px",
        paddingLeft: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#3c3c3c",
        fontSize: "12px"
    }

    const contentStyle = {
        padding: "10px",
        paddingTop: "0px",
    }

    return (<div class={"section"} style={sectionStyle}>
        <div style={sectionHeading}>
            {sectionName}
        </div>
        <div style={contentStyle}>
            {children}
        </div>
    </div>)
}