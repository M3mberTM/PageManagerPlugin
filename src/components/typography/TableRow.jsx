import React from "react";

const TableRow = ({children}) => {

    return (
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            {children}
        </div>
    )
}

export default TableRow