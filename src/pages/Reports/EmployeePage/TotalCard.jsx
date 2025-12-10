import React from 'react'

const TotalCard = ({name, amount}) => {
    return (
        <div
            style={{
                backgroundColor: '#f0f0f0',
                padding: '15px 25px',
                borderRadius: '50%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                textAlign: 'center',
                minWidth: '120px',
                fontWeight: 'bold',
            }}
        >
        {name} <br/> {amount}
        </div>
    )
}

export default TotalCard
