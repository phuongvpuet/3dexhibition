import React from 'react'
import './Step.css';
import { NavLink, Route, Link } from 'react-router-dom'
import { Button } from '@material-ui/core';
function Step() {
    return (
        <div className="step">
            <h1>I'm step</h1>
            <Link to="/view">
                <Button variant="contained" color="primary">Preview</Button>
            </Link>
        </div>
    )
}

export default Step;
