import React from 'react'

const TableHeading = ({children}) => {

    return (<div style={{flex: '1', textAlign: 'center', fontWeight: 'bold'}}>
        {children}
    </div>)
}

export default TableHeading