import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function FitBounds({ venues }) {
  const map = useMap();
  useEffect(() => {
    if (venues.length > 0) {
      const bounds = L.latLngBounds(venues.map((v) => [v.lat, v.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [venues, map]);
  return null;
}

export default function VenueMap({ venues, selectedVenue, onSelectVenue, height = '200px' }) {
  const validVenues = venues.filter((v) => v.lat && v.lng);
  if (validVenues.length === 0) return null;

  const center = [validVenues[0].lat, validVenues[0].lng];

  return (
    <div className="rounded-xl overflow-hidden border border-warm-200" style={{ height }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds venues={validVenues} />
        {validVenues.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            eventHandlers={onSelectVenue ? { click: () => onSelectVenue(v) } : {}}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{v.name}</p>
                <p className="text-gray-600">{v.address}</p>
                {v.price_per_hour ? (
                  <p className="text-green-700 font-medium">{v.price_per_hour} RON/h</p>
                ) : (
                  <p className="text-green-700 font-medium">Free</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
