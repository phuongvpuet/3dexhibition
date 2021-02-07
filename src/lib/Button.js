import React from 'react';
import texturePath from "../textures/grasslight-big.jpg";
import './css/Button.css';
class ButtonImage extends React.Component{
    onClick(){
        if (this.props.hdr) this.props.callBack(this.props.hdr)
        else this.props.callBack(this.props.src);
    }
    getSrc(){
        return this.props.src;
    }
    render(){
        return <button className="btnImage"><img className="image" src={this.props.src} alt="my image" onClick={this.onClick.bind(this)}/></button>
    }
}
export default ButtonImage;