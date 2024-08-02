import React from 'react';
import './Loader.css'; 
const Loading = () => {
    return (
        <div className="loading">
            <div className="Load-container">
                <div className="spinner"></div>
            </div>
        </div>
    );
};

export default Loading;