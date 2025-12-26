import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';

// Correction icône Leaflet par défaut (bug connu React)
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = new Icon({
    iconUrl: markerIconPng,
    iconRetinaUrl: markerIcon2xPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icône personnalisée pour les prestataires actifs
const ActiveIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function AdminLiveMap({ providers = [] }) {
  // Position par défaut (Casablanca) si aucun provider
  const defaultCenter = [33.5731, -7.5898]; 
  const center = providers.length > 0 && providers[0].lat 
    ? [providers[0].lat, providers[0].lng] 
    : defaultCenter;

  return (
    <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {providers.map((p) => (
        <Marker 
            key={p.id} 
            position={[p.lat, p.lng]} 
            icon={p.hasActiveJob ? ActiveIcon : DefaultIcon}
        >
          <Popup className="custom-popup">
            <div className="p-1">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">{p.service}</p>
                
                {p.hasActiveJob ? (
                    <span className="inline-block bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold mb-2">
                        En Mission
                    </span>
                ) : (
                    <span className="inline-block bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold mb-2">
                        Disponible
                    </span>
                )}
                
                <div className="border-t pt-2 mt-1">
                    <Link to={`/admin/users?search=${p.email}`} className="text-teal-600 text-xs font-bold hover:underline">
                        Voir Profil
                    </Link>
                </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}