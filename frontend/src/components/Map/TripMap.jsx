import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Destination icon — distinct from activity pins
const destIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  className: 'hue-rotate-[200deg] saturate-200',
});

const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

// Fits the map to a bbox or list of points
function MapController({ bbox, points }) {
  const map = useMap();
  useEffect(() => {
    if (bbox) {
      // bbox from Geoapify: [minLon, minLat, maxLon, maxLat]
      map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], { padding: [40, 40], maxZoom: 12 });
    } else if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p[0], p[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [bbox, points.length]);
  return null;
}

export default function TripMap({ activities = [], destination = '' }) {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const [destInfo, setDestInfo] = useState(null); // { lat, lng, bbox, name }

  const pinned = activities.filter((a) => a.lat && a.lng);

  // Geocode the trip destination string
  useEffect(() => {
    if (!destination || !apiKey) return;
    let cancelled = false;
    fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(destination)}&limit=1&apiKey=${apiKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.features?.length) return;
        const f = data.features[0];
        setDestInfo({
          lat: f.properties.lat,
          lng: f.properties.lon,
          bbox: f.bbox,
          name: f.properties.formatted,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [destination, apiKey]);

  if (!apiKey) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
        <MapPin size={32} />
        <p className="text-sm">Set VITE_GEOAPIFY_API_KEY to enable the map</p>
      </div>
    );
  }

  // Decide initial center: first pinned activity, or destination, or world view
  const initialCenter = pinned.length > 0
    ? [parseFloat(pinned[0].lat), parseFloat(pinned[0].lng)]
    : destInfo
      ? [destInfo.lat, destInfo.lng]
      : DEFAULT_CENTER;

  // Points to fit bounds to (activity pins + destination)
  const fitPoints = [
    ...pinned.map((a) => [parseFloat(a.lat), parseFloat(a.lng)]),
    ...(destInfo ? [[destInfo.lat, destInfo.lng]] : []),
  ];

  // Use destination bbox to fit the view when no activity pins exist
  const fitBbox = pinned.length === 0 && destInfo?.bbox ? destInfo.bbox : null;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '420px' }}>
      <MapContainer center={initialCenter} zoom={pinned.length > 0 ? 6 : DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`}
          attribution='Powered by <a href="https://www.geoapify.com/">Geoapify</a> | &copy; OpenStreetMap contributors'
        />

        <MapController bbox={fitBbox} points={fitPoints} />

        {/* Destination highlight circle */}
        {destInfo && (
          <>
            <Circle
              center={[destInfo.lat, destInfo.lng]}
              radius={pinned.length === 0 ? 80000 : 30000}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }}
            />
            <Marker position={[destInfo.lat, destInfo.lng]} icon={destIcon}>
              <Popup>
                <div className="py-1">
                  <p className="font-semibold text-sm">📍 {destination}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Trip destination</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Activity pins */}
        {pinned.map((a) => (
          <Marker key={a.id} position={[parseFloat(a.lat), parseFloat(a.lng)]}>
            <Popup>
              <div className="py-1">
                <p className="font-semibold text-sm">{a.title}</p>
                {a.location_name && <p className="text-xs text-gray-500 mt-0.5">{a.location_name}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
