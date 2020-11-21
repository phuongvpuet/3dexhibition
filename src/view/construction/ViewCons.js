import React from 'react';
import Construction from './Construction';
import SideBar from './sidebar/SideBar';
import Step from './topbar/Step';

function ViewCons() {
    return (
        <div className="ViewConstruction">
            <div className="appHeader">
				<Step />
			</div>
			<div className="appBody">
			<SideBar />
			<Construction />
			</div>
        </div>
    )
}

export default ViewCons
