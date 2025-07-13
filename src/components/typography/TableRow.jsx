import React from "react";

const TableRow = ({children}) => {

    return (
        <div style={{display: 'flex', flexDirection: 'row', paddingBottom: '3px'}}>
            {children}
        </div>
    )
}

export default TableRow