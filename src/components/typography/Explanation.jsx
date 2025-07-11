import React from 'react';

const Explanation = ({children}) => {
    return (
        <div style={{
            width: '100%',
            backgroundColor: '#323232',
            borderRadius: '7px',
            marginTop: '5px',
            marginBottom: '5px',
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingBottom: '3px',
            paddingTop: '3px',
            fontStyle: 'italic'
        }}>
            {children}
        </div>
    )
}

export default Explanation