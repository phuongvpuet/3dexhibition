import React from 'react';
import './css/Popup.css';
class Popup extends React.Component{
    render(){
        return(
            <div className="popup">
                <div className="popup_inner">
                    {console.log(this.props)}
                    <h1>{this.props.content.name}</h1>
                    <h2>{this.props.content.description}</h2>
                    <button className="closeButton" onClick={this.props.closePopup}>Close me</button>
                </div>
            </div>
        );
    }
}

export default Popup;