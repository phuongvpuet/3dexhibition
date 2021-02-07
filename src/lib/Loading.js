import React from 'react';
//import './css/Loading.css';
import Lottie from 'react-lottie';
import * as loading from './json/loading.json';
import * as done from './json/done.json';

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loading.default,
    rendererSetting:{
        preserveAspectRatio: 'xMidYMid slice'
    }
}

const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: done.default,
    rendererSetting:{
        preserveAspectRatio: 'xMidYMid slice'
    }
}

const Loading = (props) =>{
    return (
        <div className="LoadingBar">
            {
                !props.loading ? (
                    <Lottie options={defaultOptions} height={120} width={120}/>
                ) :(
                    <Lottie options={defaultOptions2} height={120} width={120}/>
                )
            }
            
        </div>
    )
}

export default Loading;