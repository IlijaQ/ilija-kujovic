import * as THREE from "three";

export function create3dGlobe(globeGridColor = "#007bff"){
    
    const globeObjectGeometry = new THREE.SphereGeometry(9, 40, 40);
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: globeGridColor,
        wireframe: true,
        transparent: true,
        opacity: 0
    });

    return new THREE.Mesh(globeObjectGeometry, globeMaterial);
}
