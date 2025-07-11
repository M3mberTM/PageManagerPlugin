import React from "react";

const TableColumn = ({children}) => {

    return (<div style={{flexGrow: '1', textAlign: 'center'}}>
        {children}
    </div>)
}

export default TableColumn