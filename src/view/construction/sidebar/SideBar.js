import React from 'react';
import './SideBar.css';

function SideBar() {
    return (
        <div className="sidebar">
            <h1>I'am a sidebar</h1>
            <div className="constructionTool">
                <h1>Construction Tools</h1>
            </div>
            <div className="noTemplate">
                <h1>Create your own</h1>
            </div>
            <div className="template">
                <h1>Template</h1>
            </div>

        </div>                  
    )                   
}

export default SideBar;     
