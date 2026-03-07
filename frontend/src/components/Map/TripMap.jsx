import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [48.8566, 2.3522];

export default function TripMap({ activities = [] }) {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const pinned = activities.filter((a) => a.lat && a.lng);
  const center = pinned.length > 0 ? [parseFloat(pinned[0].lat), parseFloat(pinned[0].lng)] : DEFAULT_CENTER;

  if (!apiKey || apiKey === 'YOUR_GEOAPIFY_API_KEY_HERE') {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
        <MapPin size={32} />
        <p className="text-sm">Set VITE_GEOAPIFY_API_KEY in frontend/.env</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '400px' }}>
      <MapContainer center={center} zoom={pinned.length > 0 ? 12 : 5} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`} attribution='Powered by <a href="https://www.geoapify.com/">Geoapify</a> | &copy; OpenStreetMap contributors' />
        {pinned.map((a) => (
          <Marker key={a.id} position={[parseFloat(a.lat), parseFloat(a.lng)]}>
            <Popup><div className="py-1"><p className="font-semibold text-sm">{a.title}</p>{a.location_name && <p className="text-xs text-gray-500">{a.location_name}</p>}</div></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
