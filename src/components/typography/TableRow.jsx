import React from "react";

const TableRow = ({children}) => {

    return (
        <div style={{display: 'flex', flexDirection: 'row', paddingBottom: '3px', borderBottom: '1px solid #191919'}}>
            {children}
        </div>
    )
}

export default TableRow