import React from "react";

const TableColumn = ({children}) => {

    return (<div style={{textAlign: 'center', paddingTop: '3px', paddingRight: '3px', paddingLeft: '3px', flex: '1 1'}}>
        {children}
    </div>)
}

export default TableColumn