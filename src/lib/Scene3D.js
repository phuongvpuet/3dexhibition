import React from "react";
import * as THREE from "./three.module.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import texturePath from "../textures/grasslight-big.jpg";
import floor_1 from "../textures/floor_1.jpg";
import backHdr from "../textures/hdr/royal_esplanade_1k.hdr";
import "./Scene3D.css";
import { OBJLoader } from "./OBJLoader.js";
import { MTLLoader } from "./MTLLoader.js";
class Scene3D extends React.Component {
  componentDidMount() {
    this.initScene();
    this.initCamera();
    this.initRenderder();
    this.initLight();
    this.initBackGround(backHdr);
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
  //   addClick() {
  //     this.renderer.domElement.addEventListener("click", (e) => {
  //       let x = e.offsetX === undefined ? e.layerX : e.offsetX;
  //       let y = e.offsetY === undefined ? e.layerY : e.offsetY;

  //       let coords3dClick = getClickIntersetion({ x: x, y: y }, e.target);
  //       if (!coords3dClick) {
  //         return;
  //       }
  //       let sp = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff0000 }));
  //       let pos = getPointInBetweenByPerc(camera.position, coords3dClick, 0.99);
  //       sp.position.set(pos.x, pos.y, pos.z);
  //       scene.add(sp);
  //       let domLabel = createDomLabel(x, y, e.target);
  //       let labelData = {
  //         sp: sp,
  //         domElem: domLabel,
  //       };
  //       arrLabels.push(labelData);
  //     });
  //   }
  onClick(event) {
    console.log("Click");
  }
  onMouseDown(event) {
    console.log("Mouse Down");
  }
  onMouseMove(event) {
    console.log("Mouse Move");
  }
  onMouseUp(event) {
    console.log("Mouse up");
  }
  loadOBJ(path, material) {
    const loader = new OBJLoader();
    //loader.setPath("../models/obj");
    const materialLoader = new MTLLoader();
    //materialLoader.setPath("../models/obj");
    var scene = this.scene;
    var self = this;
    materialLoader.load(material, function (mat) {
      loader.setMaterials(mat);
      loader.load(
        path,
        function (obj) {
          obj.y = -15;
          //scene.add(obj);
          var children = [...obj.children];
          for(let i = 0; i < children.length; i++){
              let child = children[i];
              if (child.isMesh) {
                scene.add(child);
                self.targetList.push(child);
            }
          }
          console.log("Object added");
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded of model");
        },
        function (err) {
          console.log(err);
        }
      );
    });
  }
  initCamera() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  }
  initRenderder() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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
  onEnter() {}
  initScene(scene) {
    this.name = "3DScene";
    this.clock = new THREE.Clock();
    if (!scene) this.scene = new THREE.Scene();
    else this.scene = scene;
    this.targetList = [];
    this.raycaster = new THREE.Raycaster();
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
      pmremGenerator.dispose();
    });
  }
  setTextureFloor(path) {
    this.removeChildByName("plane");
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(
      path,
      (texture) => {
        console.log("Loaded");
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
    console.log("Remove object");
    console.log(object);
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
  actionFrame() {}
}

export default Scene3D;