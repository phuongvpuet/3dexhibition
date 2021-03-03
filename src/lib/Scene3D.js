import React from "react";
import * as THREE from "./three.module.js";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import texturePath from "../textures/grasslight-big.jpg";
import floor_1 from "../textures/floor_1.jpg";
import backHdr from "../textures/hdr/hdr_1.hdr";
import "./Scene3D.css";
import {OBJLoader} from "./OBJLoader.js";
import {MTLLoader} from "./MTLLoader.js";
import {GLTFLoader} from "./GLTFLoader";

class Scene3D extends React.Component {
    componentDidMount() {
        this.initScene();
        this.initCamera();
        this.initRenderder();
        this.initLight();
        this.setBackGround(backHdr);
        //this.setTextureFloor(texturePath);
        this.addListener();
        this.onEnter();
        this.start();
    }

    addListener() {
        this.renderer.domElement.addEventListener(
            "mousedown",
            this.onMouseDown.bind(this),
            false
        );
        this.renderer.domElement.addEventListener(
            "mousemove",
            this.onMouseMove.bind(this),
            false
        );
        this.renderer.domElement.addEventListener(
            "click",
            this.onClick.bind(this),
            false
        );
    }

    onClick(event) {
        console.log("Click");
    }

    onMouseDown(event) {
        console.log("Mouse Down");
    }

    onMouseMove(event) {
        //console.log("Mouse Move");
    }

    onMouseUp(event) {
        console.log("Mouse up");
    }

    loadOBJ(path, material) {
        this.props.doneCallBack(false);
        return new Promise((res, rej) => {
            const loader = new OBJLoader();
            //loader.setPath("../models/obj");
            const materialLoader = new MTLLoader();
            //materialLoader.setPath("../models/obj");
            var scene = this.scene;
            var self = this;
            materialLoader.load(material, function (mat) {
                loader.setMaterials(mat);
                console.log("Load OBJ material");
                loader.load(
                    path,
                    function (obj) {
                        obj.y = -15;
                        //scene.add(obj);
                        var children = [...obj.children];
                        for (let i = 0; i < children.length; i++) {
                            let child = children[i];
                            if (child.isMesh) {
                                scene.add(child);
                                self.targetList.push(child);
                            }
                        }
                        console.log("Object added");
                        self.props.doneCallBack(true);
                    },
                    function (xhr) {
                        console.log((xhr.loaded / xhr.total) * 100 + "% loaded of model");
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            });
        });
    }

    loadGLB(rootFile, rootMap, filePath) {
        this.props.doneCallBack(false);
        return new Promise((res, rej) => {
            const blobURLs = [];
            let scene = this.scene;
            let self = this;
            let url = this.extractUrl(rootFile, rootMap, filePath);
            const baseURL = THREE.LoaderUtils.extractUrlBase(url);
            const manager = new THREE.LoadingManager();
            // Intercept and override relative URLs.
            manager.setURLModifier((url, path) => {
                // URIs in a glTF file may be escaped, or not. Assume that assetMap is
                // from an un-escaped source, and decode all URIs before lookups.
                // See: https://github.com/donmccurdy/three-gltf-viewer/issues/146
                const normalizedURL = rootMap + decodeURI(url)
                    .replace(baseURL, '')
                    .replace(/^(\.?\/)/, '');
                if (filePath.has(normalizedURL)) {
                    const blob = filePath.get(normalizedURL);
                    const blobURL = URL.createObjectURL(blob);
                    blobURLs.push(blobURL);
                    return blobURL;
                }
                return (path || '') + url;
            });
            const loader = new GLTFLoader(manager);
            loader.load(
                url,
                function (gltf) {
                    const sceneG = gltf.scene || gltf.scenes[0];
                    const clipsG = gltf.animations || [];
                    self.setContent(sceneG, clipsG);
                    blobURLs.forEach(URL.revokeObjectURL);
                    if (typeof rootFile === 'object') URL.revokeObjectURL(url);
                    self.props.doneCallBack(true);
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded of model gltf");
                },
                function (err) {
                    console.log(err);
                }
            );
        })
    }

    extractUrl(rootFile, rootMap, filePath){
        const fileURL = typeof rootFile === 'string'
            ? rootFile
            : URL.createObjectURL(rootFile);
        return fileURL;
    }

    setContent(object, clips){
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        this.model.push(object);
        this.controls.reset();
        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);
        const centerX = object.position.x;
        //
        this.controls.maxDistance = size * 10;
        this.camera.near = size / 10;
        this.camera.far = size * 100;
        this.camera.updateProjectionMatrix();
        //
        this.camera.position.copy(center);
        this.camera.position.x += size / 2.0;
        this.camera.position.y += size / 5.0;
        this.camera.position.z += size / 2.0;
        this.camera.lookAt(center);
        //
        this.scene.add(object);
        var centerModel = Math.floor(this.model.length / 2);
        for (let i = 0; i < this.model.length; i++){
            if (this.model.length % 2 == 0){
                if (i < this.model.length / 2) this.model[i].position.x = - (centerModel - i) * size + size / 2;
                else this.model[i].position.x =  (i + 1 - centerModel) * size - size / 2;
            }
            else {
                if (i < centerModel) this.model[i].position.x = -(centerModel - i) * size ;
                else if (i > centerModel) this.model[i].position.x =  (i - centerModel) * size ;
                else this.model[i].position.x = centerX;
            }
        }
        console.log("Length Model: ", this.model.length);
        //
        object.traverse((node) => {
            if (node.isMesh) {
                // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
                node.material.depthWrite = !node.material.transparent;
            }
        });
        //set clips
    }

    initCamera() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    }

    initRenderder() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor("#FFFFFF");
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.mount.appendChild(this.renderer.domElement);
    }

    initLight() {
        // lights
        this.light = new THREE.AmbientLight(0x666666);
        this.light.name = "defaultLight";
        this.scene.add(this.light);
    }

    onEnter() {
    }

    initScene(scene) {
        this.name = "3DScene";
        this.clock = new THREE.Clock();
        if (!scene) this.scene = new THREE.Scene();
        else this.scene = scene;
        this.targetList = [];
        this.raycaster = new THREE.Raycaster();
        this.model = [];
    }

    setBackGround(hdr) {
        if (!this.scene) return;
        console.log("Load hdr: " + hdr);
        let rgbeLoader = new RGBELoader();
        let pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        rgbeLoader.setDataType(THREE.UnsignedByteType);
        rgbeLoader.load(hdr, (texture) => {
            let envMap = pmremGenerator.fromEquirectangular(texture).texture;
            this.scene.background = envMap;
            this.scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose();
        });
    }

    setTextureFloor(path) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("anonymous");
        textureLoader.load(
            path,
            (texture) => {
                console.log("Loaded");
                console.log("Path: " + path);
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(25, 25);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                let material = new THREE.MeshLambertMaterial({
                    map: texture,
                    visible: true,
                });
                let mesh = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(2000, 2000, 8, 8),
                    material
                );
                mesh.position.y = -15;
                mesh.rotation.x = -Math.PI / 2;
                this.removeChildByName("plane");
                mesh.name = "plane";
                this.scene.add(mesh);
                this.plane = mesh;
            },
            (process) => {
                console.log((process.loaded / process.total) * 100 + "% loaded");
            },
            (err) => {
                console.log("errror");
                console.error(err);
            }
        );
    }

    removeChildByName(name) {
        var object = this.seekObject(name);
        console.log("Remove object: " + name);
        //console.log(object);
        this.scene.remove(object);
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

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
    };
    animate = () => {
        //console.log(this.props.floor);
        this.handleResize();
        let delta = this.clock.getDelta();
        this.frameId = window.requestAnimationFrame(this.animate);
        this.actionFrame();
        this.renderScene();
    };
    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    };

    seekObject(name) {
        return this.scene.getObjectByName(name);
    }

    getClickIntersetion(mouse, canvas) {
        mouse.x = (mouse.x / canvas.width) * 2 - 1;
        mouse.y = -(mouse.y / canvas.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.targetList);
        if (intersects.length == 0) {
            return null;
        }
        return intersects[0].point;
    }

    getPointInBetweenByPerc(pointA, pointB, percentage) {
        let dir = pointB.clone().sub(pointA);
        let len = dir.length();
        dir = dir.normalize().multiplyScalar(len * percentage);
        return pointA.clone().add(dir);
    }

    render() {
        return (
            <div
                className={this.name}
                ref={(mount) => {
                    this.mount = mount;
                }}
            />
        );
    }

    actionFrame() {
    }
}

export default Scene3D;
