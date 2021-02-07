import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import texturePath from '../../textures/grasslight-big.jpg'
import backHdr from '../../textures/hdr/hdr_1.hdr'

import './Scene.css'

class Scene extends React.Component {
    componentDidMount() {
        console.log("Create scene");
    
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        const clock = new THREE.Clock();
        //
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        const geometry = new THREE.BoxBufferGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const cube = new THREE.Mesh(geometry, material);
        //scene.add(cube);
        renderer.setClearColor('#FFFFFF');
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.outputEncoding = THREE.sRGBEncoding;
        let pmremGenerator = new THREE.PMREMGenerator( renderer );
        //loadHdr
        new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load(backHdr, (texture) =>{
            console.log("Load hdr");
            let envMap = pmremGenerator.fromEquirectangular( texture ).texture;
            scene.background = envMap;
            scene.environment = envMap;
            texture.dispose();
            pmremGenerator.dispose()

        })
        this.mount.appendChild(renderer.domElement);
        // lights
        scene.add(new THREE.AmbientLight(0x666666));
        //ground
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');
        textureLoader.load(
            texturePath,
            (texture) =>{
                console.log("Loaded");
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(5, 5);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                let material = new THREE.MeshLambertMaterial({map: texture});
                let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(40, 40, 2, 2), material);
                mesh.position.y = 0;
                mesh.rotation.x = - Math.PI / 2;
                scene.add(mesh);
            },
            (process) =>{
                console.log( (process.loaded / process.total * 100) + '% loaded' );
            },
            (err) =>{
                console.log("errror");
                console.error(err);
            }
        );
        //Controls 
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 10;
        controls.maxDistance = 50;
        controls.enablePan = false;
        //controls.enableDamping = true;
        controls.update();
        //loader

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.material = material;
        this.cube = cube;
        this.controls = controls;
        this.clock = clock;
        this.start();
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
            this.frameId = requestAnimationFrame(this.animate)
        }
    }

    stop = () => {
        cancelAnimationFrame(this.frameId)
    }

    animate = () => {
        // this.cube.rotation.x += 0.01;
        // this.cube.rotation.y += 0.01;
        let delta = this.clock.getDelta();
        //console.log(delta)
        this.controls.update();
        this.handleResize();
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    }

    renderScene = () => {
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <div className="constructionMain" ref={mount => {
                this.mount = mount
            }}
            />
        )
    }
}

export default Scene
