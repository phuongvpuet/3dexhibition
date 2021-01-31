import React from 'react'
import * as THREE from '../../lib/three.module.js'
import { PointerLockControls } from '../../lib/PointerLockControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import texturePath from '../../textures/grasslight-big.jpg';
import backHdr from '../../textures/hdr/royal_esplanade_1k.hdr';
import * as GlobalFunc from '../../lib/GlobalFunc.js';
import { GLTFLoader } from '../../lib/GLTFLoader.js';
import demo from '../../models/demo.glb';
import './PreviewScene.css'
import { ThreeSixtyOutlined, ThreeSixtyRounded } from '@material-ui/icons';

class PreviewScene extends React.Component {
    componentDidMount() {
        this.initScene();
        const cube = GlobalFunc.createCube(THREE);
        this.scene.add(cube);
        this.initBackGround(backHdr);
        this.objects = [];
        //ground
        this.initGround(texturePath);
        //demo
        let gltfLoad = new GLTFLoader();
        gltfLoad.load(demo, (gltf) => {
            let exh = gltf.scene;
            exh.scale.set(20, 40, 20);
            exh.position.y -= 15;
            this.scene.add(exh);
            exh.traverse(child => {
                //console.log("Name: ", child.name);
                this.objects.push(child);
            })
        }, undefined, undefined);
        //Controls 
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.controls.getObject());
        //console.log("Control Pos: " + JSON.stringify(this.controls.getObject().position));
        //Ray caster
        this.raycaster = new THREE.Raycaster();
        this.raycastHead = new THREE.Raycaster(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), 0, 10);
        //move
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        //
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        this.lastAngle = new THREE.Vector3();
        this.lastDistance = 0;
        //
        this.isMoving = false;
        this.timeMove = 0;
        //
        let sphereInter = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        sphereInter.visible = false;
        this.scene.add(sphereInter);
        this.sphereInter = sphereInter;
        this.imageObj = null;


        //event
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        document.addEventListener('mousedown', () => {
            this.controls.lock();
            if (!this.imageObj) {
                this.imagePos = null;
            }
        }, false);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.justMove = false;
        this.moveByClick = false;
        this.start();
    }
    initScene(scene) {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.clock = new THREE.Clock();
        if (!scene) this.scene = new THREE.Scene();
        else this.scene = scene;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.mouse = new THREE.Vector2();
        this.renderer.setClearColor('#FFFFFF');
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        // lights
        this.light = new THREE.AmbientLight(0x666666);
        this.scene.add(this.light);
        this.mount.appendChild(this.renderer.domElement);
    }
    initBackGround(hdr) {
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
    initGround(path) {
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
        this.lastAngle.y = 0;
        this.willViewImage = false;
        if (this.sphereInter.visible && !this.justMove) {
            //console.log("Visible");
            var camPos = this.controls.getObject().position;
            //move camera
            this.targetPos.copy(this.sphereInter.position);
            //
            let tarPos2 = new THREE.Vector3().copy(this.targetPos);
            tarPos2.y = 0;
            let camPos2 = new THREE.Vector3().copy(camPos);
            camPos2.y = 0
            this.lastDistance = tarPos2.distanceTo(camPos2) + 1;
            if (tarPos2.distanceTo(camPos2) <= 30) return;
            this.moveBackward = false;
            this.moveForward = false;
            this.targetPos.y = 10;
            //
            // let sphereInter = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            // this.scene.add(sphereInter);
            // sphereInter.position.copy(this.sphereInter.position);
            // sphereInter.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
            //
            // console.log("Target Pos: " + JSON.stringify(this.targetPos));
            // console.log("Camera: " + JSON.stringify(this.controls.getObject().position));
            var camEuler = new THREE.Euler(0, 0, 0, 'YXZ');
            camEuler.setFromQuaternion(this.controls.getObject().quaternion);

            var targetVec = new THREE.Vector3(this.targetPos.x - camPos.x, 0, this.targetPos.z - camPos.z);
            targetVec.normalize();
            var targetVec2 = new THREE.Vector3(0, 0, -1).applyEuler(camEuler);
            targetVec2.y = 0;
            var angle = targetVec2.clone().angleTo(targetVec);
            if (angle < 0.1) {
                this.moveAngle = camEuler["_y"];
                this.moveByClick = true;
                return;
            }
            var cross = targetVec.clone().cross(targetVec2);
            this.moveAngleLeft = false;
            this.moveAngleRight = false;
            if (cross.y > 0) angle = -angle;
            if (angle < 0) this.moveAngleLeft = true;
            if (angle > 0) this.moveAngleRight = true;
            this.moveAngle = angle + camEuler["_y"];
            if (this.moveAngle < -Math.PI) this.moveAngle = Math.PI - (-Math.PI - this.moveAngle);
            else if (this.moveAngle > Math.PI) this.moveAngle = -Math.PI + (this.moveAngle - Math.PI);
            // console.log("Cross: " + JSON.stringify(cross));
            // console.log("Target Vec: " + JSON.stringify(targetVec));
            // console.log("Target Vec2: ", JSON.stringify(targetVec2));
            // console.log("move angle: " + this.moveAngle);
            // console.log("Angle: " + angle);
            // console.log("Euler y: " + JSON.stringify(camEuler["_y"]));
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
                this.moveByClick = false;
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
                this.moveByClick = false;
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
        this.handleResize();
        let delta = this.clock.getDelta();
        this.frameId = window.requestAnimationFrame(this.animate);
        this.controls.getObject().position.y = 10;
        //move
        this.velocity.z -= this.velocity.z * 10 * delta;
        this.velocity.x -= this.velocity.x * 10 * delta;
        //mouse 
        this.raycaster.setFromCamera(this.mouse, this.camera);
        if (this.plane) {
            var intersects = this.raycaster.intersectObjects([this.plane], true);
            if (intersects.length > 0) {
                this.sphereInter.visible = true;
                this.sphereInter.position.copy(intersects[0].point);
                this.sphereInter.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
            } else {
                this.sphereInter.visible = false;
            }
        }
        let intersect2 = this.raycaster.intersectObjects(this.objects);
        if (intersect2.length > 0) {
            var object = intersect2[0].object;
            this.sphereInter.visible = false;
            if (object.name.startsWith("image") && !this.moveByClick) {
                this.imageObj = object;
                if (!this.imageObj.originScale) this.imageObj.originScale = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
                object.scale.set(0.2, 0.8, 0.8);
                this.sphereInter.visible = true;
                this.sphereInter.position.copy(intersect2[0].point);
                this.imagePos = new THREE.Vector3().copy(intersect2[0].point);
                this.imagePos.y = 0;
                this.sphereInter.position.y = -15;
                this.sphereInter.position.x *= 0.6;
                this.sphereInter.position.y *= 0.6;
                this.sphereInter.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
            } else {
                if (this.imageObj) {
                    this.imageObj.scale.set(this.imageObj.originScale.x, this.imageObj.originScale.y, this.imageObj.originScale.z);
                    this.imageObj = null;
                }
            }
        }
        //this.raycastHead.set(this.camera.position, x);
        let intersectCollide = this.raycastHead.intersectObjects(this.objects);
        if (intersectCollide.length > 0) {
            console.log("Collideeeee");
        }
        //-------------------- move By click --------------------------//
        if (this.moveByClick) {
            var camEuler = new THREE.Euler(0, 0, 0, 'YXZ');
            camEuler.setFromQuaternion(this.controls.getObject().quaternion);
            if (camEuler.x > 0.1 && !this.willViewImage) {
                this.controls.onMouseMove({ movementY: -5000 * delta * (camEuler.x - 0) }, true)
            } else if (camEuler.x < -0.1 && !this.willViewImage) {
                this.controls.onMouseMove({ movementY: 5000 * delta * (0 - camEuler.x) }, true)
            }
            else {
                var moveX = 0;
                if (this.moveAngleRight) moveX = 1;
                if (this.moveAngleLeft) moveX = -1;
                moveX *= 300 * delta;
                if (this.moveAngle * camEuler["_y"] > 0 && (this.lastAngle.y <= this.moveAngle && this.lastAngle.y >= camEuler["_y"] || this.lastAngle.y >= this.moveAngle && this.lastAngle.y <= camEuler["_y"])) {
                    moveX = 0;
                }
                if (moveX != 0) {
                    this.lastAngle.y = camEuler["_y"];
                    this.controls.onMouseMove({ movementX: moveX * 200 * delta }, true);
                }
                else {
                    let tarPos2 = new THREE.Vector3().copy(this.targetPos);
                    tarPos2.y = 0;
                    let camPos2 = new THREE.Vector3().copy(this.controls.getObject().position);
                    camPos2.y = 0;
                    if (tarPos2.distanceTo(camPos2) <= this.lastDistance) {
                        this.controls.moveForward(50 * delta);
                        this.lastDistance = tarPos2.distanceTo(camPos2);
                    } else {
                        if (this.imagePos) {
                            this.willViewImage = true;
                            var targetVec = new THREE.Vector3(this.imagePos.x - this.targetPos.x, 0, this.imagePos.z - this.targetPos.z);
                            targetVec.normalize();
                            var targetVec2 = new THREE.Vector3(0, 0, -1).applyEuler(camEuler);
                            targetVec2.y = 0;
                            var angle = targetVec2.clone().angleTo(targetVec);
                            var cross = targetVec.clone().cross(targetVec2);
                            this.moveAngleLeft = false;
                            this.moveAngleRight = false;
                            if (cross.y > 0) angle = -angle;
                            if (angle < 0) this.moveAngleLeft = true;
                            if (angle > 0) this.moveAngleRight = true;
                            this.moveAngle = angle + camEuler["_y"];
                            if (this.moveAngle < -Math.PI) this.moveAngle = Math.PI - (-Math.PI - this.moveAngle);
                            else if (this.moveAngle > Math.PI) this.moveAngle = -Math.PI + (this.moveAngle - Math.PI);
                            this.lastAngle.y = 0;
                            //console.log("Angle 2: ", angle);
                            this.imagePos = null;
                        }
                        else {
                            if (this.willViewImage && camEuler.x < 0.2) {
                                this.controls.onMouseMove({ movementY: 500 * delta }, true)
                            }
                            else {
                                this.moveByClick = false;
                                this.willViewImage = false;
                            }
                        }
                    }
                }

            }
        }
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.y = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 700 * delta;
        this.controls.moveForward(- this.velocity.z * delta);
        this.controls.onMouseMove({ movementX: -this.direction.y * 1500 * delta }, true)
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
