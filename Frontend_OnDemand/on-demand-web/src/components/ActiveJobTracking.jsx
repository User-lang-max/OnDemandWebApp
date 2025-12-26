import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axiosClient from '../api/axiosClient';
import { useSignalR } from '../context/SignalRContext';
import { Navigation, Loader2 } from 'lucide-react';

// --- CONFIGURATION DES ICONES ---
// Icône voiture pour le prestataire
const carIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Image de voiture/taxi
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Icône maison pour le client/destination
const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Composant pour recentrer la carte automatiquement quand la position change
function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.flyTo([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

export default function ActiveJobTracking({ job, isProvider }) {
    const { connection } = useSignalR();
    
    // Position du prestataire (celle qui bouge)
    const [providerPos, setProviderPos] = useState(null);
    // Position de la destination (le job)
    const [destPos] = useState({ lat: job.lat || 33.5731, lng: job.lng || -7.5898 });
    
    const [status, setStatus] = useState('Connexion GPS...');
    const watchId = useRef(null);

    // --- LOGIQUE PRESTATAIRE : ENVOYER LA POSITION ---
    useEffect(() => {
        if (!isProvider) return;

        if (!navigator.geolocation) {
            setStatus("Géolocalisation non supportée");
            return;
        }

        const success = async (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const newPos = { lat: latitude, lng: longitude };
            
            setProviderPos(newPos);
            setStatus("Envoi position...");

            try {
                // Envoi API (Sauvegarde DB + SignalR via Backend)
                await axiosClient.post(`/jobs/${job.id}/pings`, {
                    lat: latitude,
                    lng: longitude,
                    accuracyM: accuracy
                });
                setStatus("Position transmise");
            } catch (error) {
                console.error("Erreur envoi GPS", error);
            }
        };

        const error = (err) => setStatus("Erreur GPS : " + err.message);

        // Tracking haute précision
        watchId.current = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId.current);
    }, [isProvider, job.id]);

    // --- LOGIQUE CLIENT : RECEVOIR LA POSITION (SIGNALR) ---
    useEffect(() => {
        // Initialisation : on charge la dernière position connue
        if (job.currentLat && job.currentLng) {
            setProviderPos({ lat: job.currentLat, lng: job.currentLng });
        }

        if (connection) {
            connection.on("ReceiveLocation", (data) => {
                if (data.jobId === job.id) {
                    console.log("Nouvelle position reçue !", data);
                    setProviderPos({ lat: data.lat, lng: data.lng });
                    setStatus("Prestataire en mouvement");
                }
            });
        }

        return () => {
            if (connection) connection.off("ReceiveLocation");
        };
    }, [connection, job.id, job.currentLat, job.currentLng]);

    // Si on n'a pas encore de position prestataire
    if (!providerPos) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <Loader2 className="animate-spin mb-2 text-teal-600" />
                <p>Recherche du signal GPS...</p>
            </div>
        );
    }

    return (
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
            {/* Status Badge Overlay */}
            <div className="absolute top-4 right-4 z-[999] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-teal-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {status}
            </div>

            <MapContainer 
                center={[providerPos.lat, providerPos.lng]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marqueur Prestataire (Voiture) qui bouge */}
                <Marker position={[providerPos.lat, providerPos.lng]} icon={carIcon}>
                    <Popup>
                        <div className="text-center">
                            <strong>Prestataire</strong><br/>
                            En route
                        </div>
                    </Popup>
                </Marker>

                {/* Marqueur Destination (Maison client) Fixe */}
                <Marker position={[destPos.lat, destPos.lng]} icon={homeIcon}>
                    <Popup>Lieu d'intervention</Popup>
                </Marker>

                <RecenterMap lat={providerPos.lat} lng={providerPos.lng} />
            </MapContainer>
        </div>
    );
}