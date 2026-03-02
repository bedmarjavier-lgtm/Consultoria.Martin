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
function MapController({ center, zoom }) {
    const map = useMap();
    const isFirstRender = React.useRef(true);

    useEffect(() => {
        // Un único invalidateSize con delay para evitar el micro-salto/vibración al abrir
        const triggerInvalidate = () => map.invalidateSize({ animate: false });
        const timer = setTimeout(triggerInvalidate, 300);

        window.addEventListener('resize', triggerInvalidate);
        return () => {
            window.removeEventListener('resize', triggerInvalidate);
            clearTimeout(timer);
        };
    }, [map]);

    useEffect(() => {
        if (center) {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                // En el primer render, posicionar sin animación
                map.setView(center, zoom || 6, { animate: false });
                return;
            }
            const targetZoom = zoom || 19;
            map.flyTo(center, targetZoom, {
                duration: targetZoom <= 7 ? 1.5 : 3.5, // rápido para reset, lento para búsqueda
                easeLinearity: 0.2
            });
        }
    }, [center, zoom, map]);
    return null;
}

// Componente para capturar clicks manuales
function MapEvents({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
}

const spainBounds = [
    [20.0, -25.0], // Sur (Canarias expandido)
    [50.0, 15.0]    // Norte y Este (Baleares expandido)
];

const MapComponent = ({ center, zoom, markerPos, onMapClick, isMobile }) => {
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#00050a]">
            {/* Scanline HUD Overlay */}


            <MapContainer
                center={center}
                zoom={zoom || 6}
                minZoom={5}
                maxBounds={spainBounds}
                maxBoundsViscosity={0.5}
                className="w-full h-full"
                zoomControl={false}
                bounceAtZoomLimits={true}
                updateWhenZooming={false}
                updateWhenIdle={true}
                fadeAnimation={false}
            >
                {/* Capa Base: Satélite puro */}
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                    maxZoom={20}
                    detectRetina={false}
                    keepBuffer={12}
                />
                {/* Capa de Etiquetas */}
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}&style=feature:poi|visibility:off|feature:transit|visibility:off|feature:water|element:labels|visibility:off"
                    attribution='&copy; Google Maps'
                    maxZoom={20}
                    detectRetina={false}
                    bounds={spainBounds}
                    keepBuffer={12}
                />
                <MapController center={center} zoom={zoom} />
                {!isMobile && <MapEvents onMapClick={onMapClick} />}
                {markerPos && (
                    <Marker position={markerPos}>
                    </Marker>
                )}
            </MapContainer>

            {/* Overlay de HUD sutil */}
            <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]"></div>
        </div>
    );
};

export default MapComponent;
