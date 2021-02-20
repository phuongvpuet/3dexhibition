import React from "react";
import * as THREE from "../../lib/three.module.js";
import { PointerLockControls } from "../../lib/PointerLockControls.js";
import texturePath from "../../textures/floor_1.jpg";
import * as GlobalFunc from "../../lib/GlobalFunc.js";
import { GLTFLoader } from "../../lib/GLTFLoader.js";
import Scene3D from "../../lib/Scene3D.js";
import { OrbitControls } from "../../lib/OrbitControls.js";
import "./Showroom.css";
import objModel from "../../models/obj/bugatti.obj";
import material from "../../models/obj/bugatti.mtl";

class Showroom extends Scene3D {
  onEnter() {
    this.setTextureFloor(texturePath);
    let promise = this.loadOBJ(objModel, material);
    promise.then(()=>{});
    this.initControls();
  }
  onClick(e) {
    let x = e.offsetX === undefined ? e.layerX : e.offsetX;
    let y = e.offsetY === undefined ? e.layerY : e.offsetY;

    let coords3dClick = this.getClickIntersetion({ x: x, y: y }, e.target);
    //console.log(coords3dClick);
    if (!coords3dClick) {
      return;
    }
    let content = {
      name: "Car",
      description: "A vehicle"
    }
    this.props.showPopupCallBack(content);
  }
  initControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.update();
    this.controls = controls;
  }
  actionFrame() {
    this.controls.update();
  }
  render() {
    return (
      <div
        className="showroomMain"
        ref={(mount) => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default Showroom;
