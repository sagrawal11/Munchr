'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '../utils/distance';
import { groupProductsByCategory } from '../data/productCategories';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ visibleMachines, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      if (map && map.getContainer() && visibleMachines.length > 0) {
        const points = [...visibleMachines.map(m => m.location)];
        if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
        if (points.length > 0 && map._container) {
          map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [visibleMachines, userLocation, map]);
  return null;
}

function UserLocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !position) return;
    try {
      if (map.getContainer()) map.flyTo(position, map.getZoom());
    } catch {}
  }, [position, map]);
  if (!position) return null;
  return (
    <Circle
      center={position}
      radius={4}
      pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.65 }}
    />
  );
}

const formatDistance = (distance) => {
  if (distance < 0.1) return `${Math.round(distance * 5280)} ft`;
  return `${distance.toFixed(1)} mi`;
};

function CategorySummary({ products }) {
  const grouped = groupProductsByCategory(products);
  return (
    <div className="category-summary">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="category-item">
          <span className="category-name">{category}</span>
          <span className="category-count">({items.length})</span>
        </div>
      ))}
    </div>
  );
}

export default function VendingMap({ visibleMachines, inlineMachine, userLocation, onMachineClick }) {
  const dukeCenter = [36.0014, -78.9382];
  const markers = inlineMachine ? [inlineMachine] : visibleMachines;

  return (
    <MapContainer
      center={dukeCenter}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%' }}
      key={`${inlineMachine ? inlineMachine.id : visibleMachines.length}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map(machine => (
        <Marker key={machine.id} position={machine.location}>
          <Popup>
            <div
              className="machine-popup clickable-popup"
              onClick={() => onMachineClick(machine)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{machine.name}</h3>
              {machine.creditCardOnly && (
                <p className="credit-card-only-badge">Credit card only</p>
              )}
              <p><strong>Building:</strong> {machine.building}</p>
              <p><strong>Floor:</strong> {machine.floor}</p>
              <p><strong>Notes:</strong> {machine.notes}</p>
              {userLocation && (
                <p><strong>Distance:</strong> {formatDistance(
                  calculateDistance(userLocation.latitude, userLocation.longitude, machine.location[0], machine.location[1])
                )}</p>
              )}
              <div className="popup-products">
                <p><strong>Available Categories:</strong></p>
                <CategorySummary products={machine.products} />
              </div>
              <div className="popup-click-hint">
                <p><em>Click to view all products →</em></p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <UserLocationMarker position={[userLocation.latitude, userLocation.longitude]} />
      )}

      <MapUpdater visibleMachines={visibleMachines} userLocation={userLocation} />
    </MapContainer>
  );
}
