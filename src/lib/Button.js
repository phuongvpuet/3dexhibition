import React from 'react';
import texturePath from "../textures/grasslight-big.jpg";
class ButtonImage extends React.Component{
    
    onClick(){
        console.log("Click on me");
    }
    getSrc(){
        return this.props.src;
    }
    render(){
        var style = {width: 100, height: 100, borderRadius: 0};
        return <button><img src={this.props.src} alt="my image" onClick={this.onClick} style={style}/></button>
    }
}

export default ButtonImage;