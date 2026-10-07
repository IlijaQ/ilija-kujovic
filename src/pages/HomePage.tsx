import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { create3dGlobe } from "../three/globe";
import '../App.css';
import './HomePage.css';

const breakAtCommas = (text: string) => {
    return text.split(', ').map(segment => segment.replace(/ /g, ' ')).join(', ');
};


function HomePage() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const stackWrapperRef = useRef<HTMLDivElement | null>(null);
    const stackItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
    
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#121212");//#0f172a        // akcenat boje #007bff #39ff14

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({antialias: true});
        var availableSceneHeight = window.innerHeight * 1.15;
        renderer.setSize(window.innerWidth, availableSceneHeight);
    
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const globe = create3dGlobe("#007bff");
        scene.add(globe);

        // Store references for scroll manipulation
        const globeStartXPosition = globe.position.x;

        const animate = () => {
            requestAnimationFrame(animate);
            globe.rotation.y += 0.005;
            renderer.render(scene, camera);
        }
        animate();

        // Sequential zoom-in/zoom-out stack for the flexGrayContainer cards.
        const STACK_ITEM_COUNT = 5;
        const CYCLE_RATIO = 1.5;      // one viewport height per full zoom in/out cycle
        const OFFSET_RATIO = 0.25; // next card starts once predecessor has zoomed in to 25% size
        const TRAVEL_RATIO = 0.5;   // vertical travel per cycle, as a fraction of viewport height

        const updateStackHeight = () => {
            const wrapper = stackWrapperRef.current;
            if (!wrapper) return;

            const cyclePx = window.innerHeight * CYCLE_RATIO;
            const offsetPx = cyclePx * OFFSET_RATIO;
            const totalPx = offsetPx * (STACK_ITEM_COUNT - 1) + cyclePx;
            wrapper.style.height = `${totalPx}px`;
        };

        const handleStackScroll = () => {
            const wrapper = stackWrapperRef.current;
            if (!wrapper) return;

            const cyclePx = window.innerHeight * CYCLE_RATIO;
            const offsetPx = cyclePx * OFFSET_RATIO;
            const travelPx = window.innerHeight * TRAVEL_RATIO;
            const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
            const localScroll = window.scrollY - wrapperTop;

            stackItemRefs.current.forEach((el, i) => {
                if (!el) return;

                const start = i * offsetPx;
                const p = Math.min(Math.max((localScroll - start) / cyclePx, 0), 1);
                // Zoom in for the first half of the cycle, zoom back out for the second half.
                const scale = p <= 0.5 ? p / 0.5 : (1 - p) / 0.5;
                // Bottom of screen at p=0, middle at p=0.5, top at p=1.
                const translateY = (0.5 - p) * travelPx;

                el.style.opacity = String(scale);
                el.style.transform = `translateY(${translateY}px) scale(${scale})`;
                el.style.pointerEvents = scale > 0.1 ? "auto" : "none";
            });
        };

        updateStackHeight();
        handleStackScroll();

        const handleWindowResize = () => {
            const newHeight = window.innerHeight;
            const newWidth = window.innerWidth;
            const newAvailableSceneHeight = newHeight * 1.15;
            const oldHeight = availableSceneHeight / 1.15;

            if (
                newHeight < oldHeight ||
                newHeight > oldHeight * 1.15 ||
                newWidth !== renderer.domElement.width
            ) {
                availableSceneHeight = newAvailableSceneHeight;
                console.log("Window resized");
                        
                camera.aspect = window.innerWidth / availableSceneHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, availableSceneHeight);
                        
                // Handle globe position
                const globeRadius = (globe.geometry as THREE.SphereGeometry).parameters.radius;
                const maxScroll = 500;
                const t = Math.min(window.scrollY / maxScroll, 1);
                
                globe.position.x = (1 - t) * 0 + t * (globeRadius * 1.1);

                // Handle Scrool Stack positions
                handleStackScroll();
                updateStackHeight();
            }
        };
    
        const handleScroll = () => {
            setFadeOut(true); 

            const scroll = window.scrollY;
            // Fade in globe
            const globeFadeInFactor = Math.min(scroll / 500, 1);
            globe.material.opacity = globeFadeInFactor;
            
            // Globe movement
            const globeRadius = (globe.geometry as THREE.SphereGeometry).parameters.radius;
            const maxScroll = 500;
            const t = Math.min(scroll / maxScroll, 1)
            globe.position.x = (1 - t) * globeStartXPosition + t * (globeStartXPosition + globeRadius * 1.1);

            handleStackScroll();
        };

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("scroll", handleScroll);

            renderer.dispose();
            
            globe.geometry.dispose();
            (globe.material as THREE.Material).dispose();
            scene.remove(globe);

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
                    <img className="portfolioImg fadeInUp" src="/ik.jpg" alt="Profile picture of Ilija Kujovic" />
                    <h1 className=" text-center fadeInUp delay-1">Ilija Kujović</h1>
                    <p className=" text-center fadeInUp delay-2">C# Software Developer | React Enthusiast</p>
                    <p className={`scrollHint ${fadeOut ? "fadeOut" : "fadeInUp delay-3"}`}>
                        ↓ Scroll Down ↓
                    </p>
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
        
                <div className="stackWrapper" ref={stackWrapperRef}>
                    <div className="stackItem">
                        <div className="flexGrayContainer" ref={(el) => { stackItemRefs.current[0] = el; }}>
                            <img src="/cSharpLogo.png" ></img>
                            <p>{breakAtCommas("C#, ASP.NET, REST APIs, SignalR")}</p>
                        </div>
                    </div>
                    <div className="stackItem">
                        <div className="flexGrayContainer" ref={(el) => { stackItemRefs.current[1] = el; }}>
                            <img src="/aiLogo.png" alt="AI logo" ></img>
                            <p>{breakAtCommas("Claude, OpenAI API, AI Agents, Prompt Enginerring")}</p>
                        </div>
                    </div>
                    <div className="stackItem">
                        <div className="flexGrayContainer" ref={(el) => { stackItemRefs.current[2] = el; }}>
                            <img src="/memoryChipLogo.png" alt="Database logo" ></img>
                            <p>{breakAtCommas("MSSQL, ArangoDB, Entity Framework, Dapper")}</p>
                        </div>
                    </div>
                    <div className="stackItem">
                        <div className="flexGrayContainer" ref={(el) => { stackItemRefs.current[3] = el; }}>
                            <img src="/reactLogo.png" alt="React logo" ></img>
                            <p>{breakAtCommas("React, TypeScript, Modern Frontend")}</p>
                        </div>
                    </div>
                    <div className="stackItem">
                        <div className="flexGrayContainer" ref={(el) => { stackItemRefs.current[4] = el; }}>
                            <img src="/GearLogo.png" alt="Gear logo" ></img>
                            <p>{breakAtCommas("Selenium, Web Scraping, API Integration")}</p>
                        </div>
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