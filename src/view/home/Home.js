import { Button } from '@material-ui/core'
import React from 'react'
import './Home.css'
import { NavLink, Route, Link } from 'react-router-dom'

function Home() {
    return (
        <div>
            <h1>3D Exhibition Home Page</h1>
            <Link to="/showroom">
            <Button variant="contained" color="primary" onClick= {create}>To Showroom</Button>
            </Link>
        </div>
    )
}

function create(){
    
}

export default Home
