import { Button } from '@material-ui/core'
import React from 'react'
import './Home.css'
import { NavLink, Route, Link } from 'react-router-dom'

function Home() {
    return (
        <div>
            <h1>3D Exhibition Home Page</h1>
            <Link to="/construction">
            <Button variant="contained" color="primary" onClick= {create}>Create</Button>
            </Link>
        </div>
    )
}

function create(){
    
}

export default Home
