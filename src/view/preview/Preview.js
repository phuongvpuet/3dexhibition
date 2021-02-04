import React from 'react'
import './Preview.css'
import PreviewScene from './PreviewScene';
import Showroom from '../showroom/Showroom';
import ButtonImage from '../../lib/Button';
import texturePath from "../../textures/grasslight-big.jpg";

function Preview() {
    return (
        <div className="preview">
            <ButtonImage src={texturePath}/>
            <Showroom />
        </div>
    )
}

export default Preview
