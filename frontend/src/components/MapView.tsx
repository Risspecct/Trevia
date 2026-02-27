import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon with CDN URLs instead of problematic imports
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (label: string) => void;
}

const MapView = ({
  center = [22.5, 78.9],
  zoom = 5,
  markers = [],
  className = "",
  onMarkerClick,
}: MapViewProps) => {
  return (
    <div className={`rounded-2xl overflow-hidden gold-border ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full min-h-[400px]"
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker
            key={i}
            position={[m.lat, m.lng]}
            eventHandlers={{
              click: () => onMarkerClick?.(m.label),
            }}
          >
            <Popup>
              <div>
                <strong>{m.label}</strong>
                {m.sublabel && <p style={{ fontSize: 12, marginTop: 4 }}>{m.sublabel}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
