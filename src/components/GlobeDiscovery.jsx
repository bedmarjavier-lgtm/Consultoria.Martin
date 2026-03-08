import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const GlobeDiscovery = ({ isBlurred, isZooming }) => {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Redimensionado
    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleGlobeReady = () => {
        const globe = globeRef.current;
        if (!globe) return;

        const ctrl = globe.controls();
        ctrl.enableZoom = false;
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.5;

        globe.pointOfView({ lat: 40, lng: -3, altitude: isBlurred ? 4.5 : 2.5 }, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
        const sunLight = new THREE.DirectionalLight(0xfff8e7, 3.0);
        sunLight.position.set(5, 3, 5);
        const fillLight = new THREE.DirectionalLight(0x335577, 1.2);
        fillLight.position.set(-5, -2, -3);

        globe.lights([ambientLight, sunLight, fillLight]);
    };

    // Ajuste de altitud al cambiar auth
    useEffect(() => {
        if (!globeRef.current) return;
        globeRef.current.pointOfView({ lat: 40, lng: -3, altitude: isBlurred ? 4.5 : 2.5 }, 1500);
    }, [isBlurred]);

    // Zoom cinematográfico al autenticar
    useEffect(() => {
        if (globeRef.current && isZooming) {
            globeRef.current.pointOfView({ lat: 40, lng: -3, altitude: 1.5 }, 2000);
        }
    }, [isZooming]);

    return (
        <div className="absolute inset-0 bg-[#00050a] overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 transition-all duration-[2000ms] pointer-events-none ${isBlurred ? 'blur-md scale-105 opacity-75' : 'opacity-90'}`}>
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    atmosphereColor="#00f2ff"
                    atmosphereAltitude={0.18}
                    backgroundColor="rgba(0,0,0,0)"
                    showStars={true}
                    starRadius={0.5}
                    starColor={() => "#ffffff"}
                    onGlobeReady={handleGlobeReady}
                />
                {/* Vignette radial */}
                <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
            </div>
        </div>
    );
};

export default GlobeDiscovery;
