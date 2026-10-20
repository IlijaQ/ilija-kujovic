import { useEffect, useRef, useState } from "react";
import { create3dGlobe } from "../three/globe";
import * as THREE  from "three";
import '../App.css';
import './DownloadResumePage.css';
import { BASE_URL } from "../commonVariables.ts";

const DOWNLOAD_URL_KEYS = ['url', 'downloadUrl', 'download_url', 'link', 'downloadLink', 'download_link'];


async function openServerLink(path: string): Promise<void> {
    const newTab = window.open('', '_blank');
    if (newTab) newTab.opener = null;

    try {
        const response = await fetch(BASE_URL + path);
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const link = await extractDownloadUrl(response);
        if (!link) {
            throw new Error('Server did not return a link');
        }

        if (newTab) {
            newTab.location.href = link;
        } else {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    } catch (err) {
        newTab?.close();
        console.error(`Failed to open link for ${path}`, err);
    }
}
async function extractDownloadUrl(response: Response): Promise<string | null> {
    const text = (await response.text()).trim();
    if (isHttpUrl(text)) return text;

    try {
        const data: unknown = JSON.parse(text);
        if (isHttpUrl(data)) return data;
        if (data && typeof data === 'object') {
            for (const key of DOWNLOAD_URL_KEYS) {
                const candidate = (data as Record<string, unknown>)[key];
                if (isHttpUrl(candidate)) return candidate;
            }
        }
    } catch {
        // Not JSON and not a bare URL; fall through.
    }
    return null;
}
function isHttpUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

function DownloadResumePage() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const contactRowRef = useRef<HTMLDivElement | null>(null);
    const contactItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const contactTextRef = useRef<HTMLParagraphElement | null>(null);


    const handleDownloadResume = async () => {
        if (pin.length !== 4) {
            setError('PIN mora imati 4 cifre');
            return;
        }

        setIsLoading(true);
        setError('');
        setDownloadSuccess(false);

        try {
            const response = await fetch(BASE_URL + '/1ctvd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });

            if (response.ok) {
                const downloadUrl = await extractDownloadUrl(response);
                if (!downloadUrl) {
                    setError('Server did not return a download link');
                    return;
                }
                // The link points to Google Drive and serves the file as an
                // attachment, so navigating to it starts the download without
                // leaving this page.
                window.location.assign(downloadUrl);
                setPin('');
                setDownloadSuccess(true);
            } else {
                if (response.status === 401) {
                    setError('Unauthorized PIN');
                } else {
                    setError(response.statusText);
                }
            }     
        } catch (err) {
            setError('Error Downloading Resume');
        } finally {
            setIsLoading(false);
        }
    };

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

                
            }
        }
        
        const CONTACT_RANGE_RATIO = 0.5;   // scroll distance (fraction of viewport height) the whole motion spans
        const CONTACT_OVERLAP = 0.7;       // next icon starts when the previous one is 70% done

        const handleContactScroll = () => {
            const row = contactRowRef.current;
            const items = contactItemRefs.current.filter((el): el is HTMLDivElement => !!el);
            if (!row || items.length === 0) return;

            const rangePx = window.innerHeight * CONTACT_RANGE_RATIO;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const q = Math.min(Math.max((window.scrollY - (maxScroll - rangePx)) / rangePx, 0), 1);

            // Item i runs for `d` of the range and starts at i * CONTACT_OVERLAP * d; last one ends at 1.
            const d = 1 / (1 + (items.length - 1) * CONTACT_OVERLAP);
            const rowWidth = row.clientWidth;

            items.forEach((el, i) => {
                const p = Math.min(Math.max((q - i * CONTACT_OVERLAP * d) / d, 0), 1);
                const startOffset = rowWidth - (el.offsetLeft + el.offsetWidth);
                el.style.transform = `translateX(${(1 - p) * startOffset}px)`;
                el.style.opacity = String(Math.min(p * 5, 1));
                el.style.pointerEvents = p > 0.9 ? "auto" : "none";
            });

            contactTextRef.current?.classList.toggle("visible", q >= 0.999);
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
            const t = Math.min(scroll / maxScroll, 1);
            globe.position.x = (1 - t) * globeStartXPosition + t * (globeStartXPosition + globeRadius * 1.1);

            handleContactScroll();
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
                    <p className=" text-center fadeInUp delay-2">
                        <span>C# Software Developer</span>
                        <br/>
                        <span>React Enthusiast</span>
                    </p>
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
      
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>
                    {downloadSuccess ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#28a745" }}>
                    Download Successful
                </span>
                ) : ( "Download My Resume" )}
                </h2>
            </div>

            {/* Resume Download Section */}
            {!downloadSuccess && (
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Enter PIN to download"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        style={{
                            padding: "0.75rem",
                            fontSize: "1rem",
                            borderRadius: "8px",
                            border: "1px solid #007bff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "white",
                            textAlign: "center",
                            width: "200px",
                            marginRight: "1rem"
                    }}/>
                    <button
                        onClick={handleDownloadResume}
                        disabled={isLoading || pin.length !== 4}
                        className="downloadButton"
                    >      
                        {isLoading ? 'Loading...' : 'Download CV'}
                    </button>
                    </div>
                        {error && (
                        <div style={{
                            color: "#ff6b6b",
                            fontSize: "0.9rem",
                            marginTop: "0.5rem"
                        }}>
                            {error}
                        </div>
                    )}
                    </div>
                )}
        
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                        gap: "2rem",
                        marginTop: "3rem"
                    }}>
                    <div className="contactSpacer" />
                    <div className="contactSection" ref={contactRowRef}>
                        <div className="buttonContainer" ref={(el) => { contactItemRefs.current[0] = el; }}
                            style={{ cursor: "pointer" }}
                            onClick={() => openServerLink('/3lknm')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openServerLink('/3lknm'); }}
                            >
                                <img className="contactImg" src="/LinkedinLogo.png" ></img>
                        </div>
                        <div className="buttonContainer" ref={(el) => { contactItemRefs.current[1] = el; }}
                            style={{ cursor: "pointer" }}
                            onClick={() => openServerLink('/2msd1')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openServerLink('/2msd1'); }}
                            >
                                <img className="contactImg" src="/GmailLogo.png" ></img>
                        </div>
                        <p className="contactText" ref={contactTextRef}>
                            Let's stay in touch
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default DownloadResumePage