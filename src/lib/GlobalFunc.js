var createCube = function (three) {
    const geometry = new three.BoxBufferGeometry(2, 2, 2);
    const material = new three.MeshBasicMaterial({ color: 0xff00ff });
    const cube = new three.Mesh(geometry, material);
    return cube;
}

export { createCube };