import { useEffect, useRef } from "react";
import { create3dGlobe } from "../three/globe";
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

        const globe = create3dGlobe("#007bff");
        scene.add(globe);
        //positionGlobeAtLeftEdge(globe, camera);

        // Store references for scroll manipulation
        const globeStartXPosition = globe.position.x;


        const animate = () => {
            requestAnimationFrame(animate);

            globe.rotation.y += 0.005;

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
            // Fade in globe
            const globeFadeInFactor = Math.min(scroll / 500, 1);
            globe.material.opacity = globeFadeInFactor;
            
            // Pomeri globe ulevo od početne pozicije
            const globeRadius = (globe.geometry as THREE.SphereGeometry).parameters.radius;
            const maxScroll = 500; // koliko skrola treba da završi pomeraj
            const t = Math.min(scroll / maxScroll, 1); // normalizovan faktor 0 → 1

            // interpolacija: od globeStartX → globeStartX - radius/2
            globe.position.x = (1 - t) * globeStartXPosition + t * (globeStartXPosition + globeRadius * 1.1);
        };

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("scroll", handleScroll);

            renderer.dispose();

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
                    <h1 className=" text-center">Ilija Kujović</h1>
                    <p className=" text-center">C# Software Developer | React Enthusiast</p>
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