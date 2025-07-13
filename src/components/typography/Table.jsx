import React from "react";

const Table = ({children}) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#323232', color: 'white', paddingTop: '3px', paddingBottom: '3px'}}>
            {children}
        </div>
    )
}
export default Table