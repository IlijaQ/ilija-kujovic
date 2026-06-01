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

//export function positionGlobeAtLeftEdge(globe: THREE.Mesh, camera: THREE.PerspectiveCamera) {
    //const z = globe.position.z - camera.position.z;
    //const halfWidth = Math.tan((camera.fov * Math.PI) / 360) * Math.abs(z) * camera.aspect;
    //const globeRadius = 1

    //globe.position.x = - halfWidth + globeRadius;
     //globe.position.x = + halfWidth * 3 + globeRadius;
//}
