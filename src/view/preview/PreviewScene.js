import React from 'react'
import * as THREE from 'three'
import { PointerLockControls } from '../../lib/PointerLockControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import texturePath from '../../textures/grasslight-big.jpg'
import backHdr from '../../textures/hdr/royal_esplanade_1k.hdr'
import * as GlobalFunc from '../../lib/GlobalFunc.js'

import './PreviewScene.css'

class PreviewScene extends React.Component {
    componentDidMount() {
        this.initScene();
        const cube = GlobalFunc.createCube(THREE);
        this.scene.add(cube);
        this.initBackGround(backHdr);
        //ground
        this.initGround(texturePath);
        //Controls 
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.controls.getObject());
        this.controls.getObject().position.y = 10;
        //Ray caster
        this.raycaster = new THREE.Raycaster();
        //move
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        //
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        //
        this.isMoving = false;
        this.timeMove = 0;
        //
        let sphereInter = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        sphereInter.visible = false;
        this.scene.add(sphereInter);
        this.sphereInter = sphereInter;


        //event
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        document.addEventListener('mousedown', () => {
            this.controls.lock();
        }, false);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.justMove = false;
        this.moveByClick = false;
        this.start();
    }
    initScene(scene){
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.clock = new THREE.Clock();
        if (!scene) this.scene = new THREE.Scene();
        else this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mouse = new THREE.Vector2();
        this.camera.position.z = 10;
        this.renderer.setClearColor('#FFFFFF');
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        // lights
        this.light = new THREE.AmbientLight(0x666666);
        this.scene.add(this.light);
        this.mount.appendChild(this.renderer.domElement);
    }
    initBackGround(hdr){
        if (!this.scene) return;
        let rgbeLoader = new RGBELoader();
        let pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        rgbeLoader.setDataType(THREE.UnsignedByteType);
        rgbeLoader.load(hdr, (texture) => {
            console.log("Load hdr");
            let envMap = pmremGenerator.fromEquirectangular(texture).texture;
            this.scene.background = envMap;
            this.scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose()
        })
    }
    initGround(path){
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');
        textureLoader.load(
            path,
            (texture) => {
                console.log("Loaded");
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(25, 25);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                let material = new THREE.MeshLambertMaterial({ map: texture, visible: true });
                let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000, 8, 8), material);
                mesh.position.y = -15;
                mesh.rotation.x = - Math.PI / 2;
                this.scene.add(mesh);
                this.plane = mesh;
            },
            (process) => {
                console.log((process.loaded / process.total * 100) + '% loaded');
            },
            (err) => {
                console.log("errror");
                console.error(err);
            }
        );

    }
    onMouseUp(event) {
        this.controls.unlock();
        if (this.sphereInter.visible == true && !this.justMove) {
            console.log("Visible");
            //move camera
            this.targetPos.copy(this.sphereInter.position);
            this.moveBackward = false;
            this.moveForward = false;
            this.targetPos.y = 10;
            this.moveByClick = true;
        }
        this.justMove = false;
    }
    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveBackward = false;
                this.moveForward = true;
                this.isMoving = true;
                this.moveByClick = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveForward = false;
                this.moveBackward = true;
                this.isMoving = true;
                this.moveByClick = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
        }
    }
    onKeyUp(event) {
        //console.log(event.keyCode);
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                this.velocity.y = 0;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                this.velocity.y = 0;
                break;
        }
        this.isMoving = false;
        this.timeMove = 0;
    }
    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }
    handleResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    start = () => {
        console.log("Start");
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);

        }
    }
    stop = () => {
        cancelAnimationFrame(this.frameId)
    }
    animate = () => {
        // this.cube.rotation.x += 0.01;
        // this.cube.rotation.y += 0.01;
        let delta = this.clock.getDelta();
        this.delta = delta;
        //console.log(delta)
        this.handleResize();
        this.frameId = window.requestAnimationFrame(this.animate);
        this.controls.getObject().position.y = 10;
        //move
        this.velocity.z -= this.velocity.z * 10 * delta;
        this.velocity.x -= this.velocity.x * 10 * delta;
        //mouse 
        // console.log(this.mouse);
        // console.log(this.camera);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        if (this.plane) {
            //console.log(this.scene.children);
            var intersects = this.raycaster.intersectObjects([this.plane], true);
            if (intersects.length > 0) {
                this.sphereInter.visible = true;
                this.sphereInter.position.copy(intersects[0].point);
                this.sphereInter.scale.copy(new THREE.Vector3(1, 1, 1));
            } else {
                this.sphereInter.visible = false;
            }
        }
        //
        if (this.moveByClick) {
            //console.log("Move By Click");
        }
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.y = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 500 * delta;
        //if (this.moveLeft || this.moveRight) this.velocity.y -= this.direction.y * 2 * delta;
        this.controls.moveForward(- this.velocity.z * delta);
        this.controls.onMouseMove({movementX: -this.direction.y * 1000 * delta}, true)
        this.renderScene();

    }
    onMouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / this.mount.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.mount.clientHeight) * 2 + 1;
        if (this.controls.isLocked) this.justMove = true;
    }
    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    }
    render() {
        return (
            <div className="previewMain" ref={mount => {
                this.mount = mount
            }}
            />
        )
    }
}

export default PreviewScene;
