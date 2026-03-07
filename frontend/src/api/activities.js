import api from './axios';
export const addActivity = (tripId, dayIndex, data) => api.post(`/trips/${tripId}/itinerary/days/${dayIndex}/activities`, data);
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
export const reorderActivity = (id, order_index) => api.patch(`/activities/${id}/reorder`, { order_index });
