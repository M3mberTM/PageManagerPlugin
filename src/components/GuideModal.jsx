import React from "react";
import "./CommonStyles.css";

export const GuideModal = ({dialog, handleClose}) => {

    return (
        <div style={{width: "400px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <sp-heading style={{marginTop: 0}}>Simple guide for Template making</sp-heading>
            <sp-body>
                Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
            </sp-body>
                <br/>
                <div class={"table-style"}>
                    <div class={"row-header-style"}>
                        <sp-heading size={"XS"} class={"col-style text-center col-right-border width-50"}>Command</sp-heading>
                        <sp-heading size={"XS"} class={"col-style text-center width-50"}>Explanation</sp-heading>
                    </div>
                    <div class={"row-style"}>
                        <sp-body class={"col-style col-right-border width-50"} >some</sp-body>
                        <sp-body class={"col-style width-50 left-pad"}>something placeholder</sp-body>
                    </div>
                    <div class={"row-style"}>
                        <sp-body class={"col-style col-right-border width-50"}>some</sp-body>
                        <sp-body class={"col-style width-50 left-pad"}>something placeholder</sp-body>
                    </div>
                </div>
            </div>
            <br/>
            <div class={"right-div-align"}>
            <sp-action-button onClick={handleClose}>Close</sp-action-button>
            </div>
        </div>
    )
}