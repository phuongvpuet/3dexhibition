import React from 'react'
import * as THREE from '../../lib/three.module.js'
import { PointerLockControls } from '../../lib/PointerLockControls.js';
import texturePath from '../../textures/floor_1.jpg';
import * as GlobalFunc from '../../lib/GlobalFunc.js';
import { GLTFLoader } from '../../lib/GLTFLoader.js';
import Scene3D from '../../lib/Scene3D.js';
import { OrbitControls } from '../../lib/OrbitControls.js'
import './Showroom.css';
import objModel from '../../models/obj/bugatti.obj';
import material from '../../models/obj/bugatti.mtl';

class Showroom extends Scene3D {
    onEnter(){
        // const cube = GlobalFunc.createCube(THREE);
        // this.scene.add(cube);
        // this.cube = cube;
        this.setTextureFloor(texturePath);
        this.loadOBJ(objModel, material);
        this.initControls();
    }
    initControls(){
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 10;
        controls.maxDistance = 500;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.update();
        this.controls = controls;
    }
    actionFrame(){
        this.controls.update();
    }
    render() {
        return (
            <div className="showroomMain" ref={mount => {
                this.mount = mount
            }}
            />
        )
    }
}

export default Showroom;