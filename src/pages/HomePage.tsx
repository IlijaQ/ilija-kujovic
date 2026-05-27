import { useEffect, useRef } from "react";
import { createParticles } from "../three/particles";
import * as THREE from "three";
import '../App.css';
import './HomePage.css';


function HomePage() {
    const mountRef = useRef<HTMLDivElement | null>(null);

  
    useEffect(() => {
    
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#121212");//#0f172a        // akcenat boje #007bff #39ff14

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({antialias: true});
        var availableSceneHeight = window.innerHeight * 1.1;
        renderer.setSize(window.innerWidth, availableSceneHeight);
    
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

        const handleWindowResize = () => {
            if(window.innerHeight > availableSceneHeight) {
                availableSceneHeight = window.innerHeight * 1.1;
                console.log("Window resized");
                camera.aspect = window.innerWidth / availableSceneHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, availableSceneHeight);
            }
        }
    
        const handleScroll = () => {
            const scroll = window.scrollY;
            const scaleFactor = 1 + (scroll / 1000); // Increase width based on scroll
      
            // Update particle positions to increase width
            for(let i = 0; i < positions.length; i += 3) {
                positions[i] = originalPositions[i] * scaleFactor; // Scale X position
                positions[i + 1] = originalPositions[i + 1]; // Keep Y unchanged
                positions[i + 2] = originalPositions[i + 2]; // Keep Z unchanged
            }
      
            geometry.attributes.position.needsUpdate = true;
        };

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("scroll", handleScroll);

            renderer.dispose();
            geometry.dispose();
            particles.material.dispose();

            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    
    }, []);

    return (
        <div style={{ position: "relative", width: "100vw", minHeight: "200vh" }}>
    
            <div
                ref={mountRef}
                style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 1
            }}/>

            <section style={{ position: "relative", zIndex: 2, height: "100vh" }}>
                <div className="heroSection">
                    <img className="portfolioImg" src="/ik.jpg" alt="Profile picture of Ilija Kujovic" />
                    <h1>Ilija Kujović</h1>
                    <p>C# Software Developer | React Enthusiast</p>
                </div>      
            </section>  

            <section style={{ 
                position: "relative", 
                zIndex: 3, 
                background: "linear-gradient(to bottom, transparent, #121212)",
                padding: "4rem 2rem",
                color: "white",
                minHeight: "100vh"
            }}>
        
                <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "2rem",
                marginTop: "3rem"
                }}>
                    <div className="flexGrayContainer">
                        <img src="/cSharpLogo.png" ></img>
                        <p>ASP.NET, Widows Forms, WPF, SignalR, Selenium</p>
                    </div>
                    <div className="flexGrayContainer">
                        <img src="/aiLogo.png" alt="AI logo" ></img>
                        <p>Browserable Agentic Browser, OpenAI API</p>
                    </div>
                    <div className="flexGrayContainer">
                        <img src="/memoryChipLogo.png" alt="Database logo" ></img>
                        <p>MSSQL, ArangoDB, Entity Framework, Dapper</p>
                    </div>
                    <div className="flexGrayContainer">
                        <img src="/reactLogo.png" alt="React logo" ></img>
                        <p>React, HTML, CSS</p>
                    </div>
                    </div>
                    <div className="contactSection">
                    <p style={{ fontSize: "1.2rem", lineHeight: 1.6, marginBottom: "0.2rem" }}>
                        Let's stay in touch:
                    </p>
                    <div className="buttonContainer">
                        <a href="https://www.linkedin.com/in/ilija-kujovic-126352204" target="_blank">
                        <img className="contactImg" src="/LinkedinLogo.png" ></img>
                        </a>
                    </div>
                    <div className="buttonContainer">
                        <a href="https://github.com/ilijaq" target="_blank">
                        <img className="contactImg" src="/GithubIcoWhite.png" ></img>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage