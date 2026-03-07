import api from './axios';
export const getItinerary = (tripId) => api.get(`/trips/${tripId}/itinerary`);
export const updateDayNotes = (tripId, dayIndex, notes) => api.patch(`/trips/${tripId}/itinerary/days/${dayIndex}/notes`, { notes });
