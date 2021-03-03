import React from 'react';
import "./css/DropZone.css";
import { SimpleDropzone } from 'simple-dropzone';

class DropZone extends React.Component {
    componentDidMount() {
        this.drop = document.querySelector(".dropZoneInner");
        this.input = document.querySelector("#file-input");
        const dropCtrl = new SimpleDropzone(this.drop, this.input);
        dropCtrl.on('drop', ({ files }) => this.load(files));
        dropCtrl.on('dropstart', () => { });
        dropCtrl.on('droperror', () => { });
    }
    load(fileMap) {
        let rootFile;
        let rootPath;
        Array.from(fileMap).forEach(([path, file]) => {
            if (file.name.match(/\.(gltf|glb)$/)) {
                rootFile = file;
                rootPath = path.replace(file.name, '');
            }
        });

        if (!rootFile) {
            console.log('No .gltf or .glb asset found.');
        }

        console.log("Root File: " + JSON.stringify(rootFile));
        console.log("Root Path: " + rootPath);
        console.log("File Map: " + JSON.stringify(fileMap));
    }
    render() {
        return (
            <div className="dropZone">
                <div className="dropZoneInner">
                    <div class="placeholder">
                        <p>Kéo thả file gltf hoặc file glb vào đây</p>
                    </div>
                    <div class="upload-btn">
                        <input type="file" name="file-input[]" id="file-input" multiple="" />
                        <label for="file-input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
                            <span>Tải lên</span>
                        </label>
                    </div>

                </div>
            </div>
        );
    }
}

export default DropZone;