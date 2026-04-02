import React, { useEffect, useRef, useState } from "react";
import { createParticles } from "./three/particles";
import * as three from "three";
import { div } from "three/tsl";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    
    const scene = new three.Scene();
    scene.background = new three.Color("#121212");//#0f172a        // akcenat boje #007bff #39ff14

    const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new three.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }


    const particles = createParticles(500, "#007bff");
    scene.add(particles);
    
    // Store references for scroll manipulation
    const geometry = particles.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const originalPositions = new Float32Array(positions);




    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.y += 0.007;
      particles.rotation.x += 0.002;



      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("scroll", () => {
      const scroll = window.scrollY;
      const scaleFactor = 1 + (scroll / 1000); // Increase width based on scroll
      
      // Update particle positions to increase width
      for(let i = 0; i < positions.length; i += 3) {
        positions[i] = originalPositions[i] * scaleFactor; // Scale X position
        positions[i + 1] = originalPositions[i + 1]; // Keep Y unchanged
        positions[i + 2] = originalPositions[i + 2]; // Keep Z unchanged
      }
      
      geometry.attributes.position.needsUpdate = true;
    });



    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
    
  }, []);

  return (
  <div style={{ position: "relative", width: "100vw", minHeight: "200vh" }}>
    
  </div>
  );


  
}

export default App
