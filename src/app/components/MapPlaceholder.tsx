import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
}

function MapController({
  center,
  zoom,
}: {
  center?: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);

  return null;
}

export function MapComponent({
  center = [-18.5122, -44.555],
  zoom = 13,
  markers = [],
}: MapComponentProps) {
  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} />
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Keep the old placeholder for fallback
export function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center relative overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(236, 236, 236, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 236, 236, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Route line */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 150 Q 150 50, 250 150 T 450 250"
          stroke="#0F5F4A"
          strokeWidth="4"
          fill="none"
          strokeDasharray="10,5"
          opacity="0.6"
        />
      </svg>

      {/* Location markers */}
      <div className="absolute top-20 left-12 w-6 h-6 bg-primary rounded-full border-4 border-primary-foreground shadow-lg animate-pulse" />
      <div className="absolute bottom-24 right-16 w-6 h-6 bg-primary rounded-full border-4 border-primary-foreground shadow-lg" />

      <p className="text-muted-foreground z-10">Mapa da Rota</p>
    </div>
  );
}
