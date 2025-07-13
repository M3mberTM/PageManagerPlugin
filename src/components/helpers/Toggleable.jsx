import React from "react";

const Toggleable = ({children, isToggled}) => {

    if (!isToggled) {
        return null
    }

    return (
        <div>
            {children}
        </div>
    )
}
export default Toggleable