import React, { useState, useEffect } from "react";
import "./Preview.css";
import PreviewScene from "./PreviewScene";
import Showroom from "../showroom/Showroom";
import ButtonImage from "../../lib/Button";
import grass from "../../textures/grasslight-big.jpg";
import rock from "../../textures/floor_1.jpg";
import hdr_1 from "../../textures/hdr/hdr_1.hdr";
import hdr_1_img from "../../textures/hdr/hdr_1.PNG";
import hdr_2 from "../../textures/hdr/hdr_2.hdr";
import hdr_2_img from "../../textures/hdr/hdr_2.PNG";
import Loading from "../../lib/Loading";
import Popup from "../../lib/PopUp";
import SimpleDropZOne from 'simple-dropzone';
import DropZone from "../../lib/DropZone";

function Preview() {
  let scene = null;
  const [done, setDone] = useState(true);
  const [load, setLoad] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [contentPopup, setContentPopup] = useState(null);
  const setFloor = function (img) {
    scene.setTextureFloor(img);
  };
  const setHdr = function (img) {
    scene.setBackGround(img);
  };
  const setLoading = function (loading) {
    console.log("Set loading: " + loading);
    if (loading){
        setTimeout(()=>{
            setLoad(loading);
            setTimeout(()=>{
                setDone(loading)
            }, 1000)
        }, 500);
    } else setDone(loading);
  };
  const showPopup = function(content){
    console.log(content);
    setContentPopup(content);
    setIsPopup(true);
  }
  return (
    <div className="preview">
      <span className="ButtonNav">
        <ButtonImage src={grass} callBack={setFloor} />
        <ButtonImage src={rock} callBack={setFloor} />
      </span>
      <span className="ButtonNav2">
        <ButtonImage src={hdr_1_img} callBack={setHdr} hdr={hdr_1} />
        <ButtonImage src={hdr_2_img} callBack={setHdr} hdr={hdr_2} />
      </span>
      <Showroom
        ref={(instance) => {
          scene = instance;
        }}
        doneCallBack={setLoading}
        showPopupCallBack = {showPopup}
      />
      {!done ? (
        <div className="loading">
          <Loading loading={load}/>
        </div>
      ) : (
        <div></div>
      )}
      {
        isPopup ? (
          <div className="scenePopup">
            <Popup content={contentPopup} closePopup = {()=>{setIsPopup(false)}}/>
          </div>
        ) : (
          <div></div>
        )
      }
      <div className="sceneDropZone">
        <DropZone />
      </div>
    </div>
  );
}

export default Preview;
