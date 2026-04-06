import * as three from "three";

export function createParticles(count = 5000, color = "#007bff"){
    const geometry = new three.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for(let i = 0; i < count * 3; i++){
        positions[i] = (Math.random() - 0.5) * 12;
    }

    geometry.setAttribute("position", new three.BufferAttribute(positions, 3));

    const material = new three.PointsMaterial({ size: 0.04, color });
    

    
    return new three.Points(geometry, material);
}