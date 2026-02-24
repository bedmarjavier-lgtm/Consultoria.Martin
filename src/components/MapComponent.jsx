import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon loading
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente para manejar el vuelo cinematográfico
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 19, {
                duration: 3.5,
                easeLinearity: 0.2
            });
        }
    }, [center, map]);
    return null;
}

const MapComponent = ({ center, markerPos }) => {
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Scanline HUD Overlay */}
            <div className="absolute inset-0 z-[450] pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

            <MapContainer
                center={center}
                zoom={19}
                className="w-full h-full"
                zoomControl={false}
                style={{ filter: 'contrast(1.1) brightness(0.9) saturate(1.2)' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <MapController center={center} />
                {markerPos && (
                    <Marker position={markerPos}>
                    </Marker>
                )}
            </MapContainer>

            {/* Overlay de gradiente para inmersión OceanX */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_250px_rgba(0,0,0,1)] z-[400]"></div>
        </div>
    );
};

export default MapComponent;
