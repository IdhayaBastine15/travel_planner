import React, { createContext, useContext, useState, useCallback } from 'react';
import * as tripsApi from '../api/trips';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try { const res = await tripsApi.getTrips(); setTrips(res.data); } finally { setLoading(false); }
  }, []);

  const addTrip = useCallback((trip) => setTrips((p) => [trip, ...p]), []);
  const removeTrip = useCallback((id) => setTrips((p) => p.filter((t) => t.id !== id)), []);
  const updateTripInList = useCallback((updated) => setTrips((p) => p.map((t) => (t.id === updated.id ? updated : t))), []);

  return <TripContext.Provider value={{ trips, loading, fetchTrips, addTrip, removeTrip, updateTripInList }}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used within TripProvider');
  return ctx;
}
