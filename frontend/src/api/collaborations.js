import api from './axios';
export const getCollaborators = (tripId) => api.get(`/trips/${tripId}/collaborators`);
export const inviteCollaborator = (tripId, data) => api.post(`/trips/${tripId}/collaborators/invite`, data);
export const changeRole = (tripId, userId, role) => api.patch(`/trips/${tripId}/collaborators/${userId}`, { role });
export const removeCollaborator = (tripId, userId) => api.delete(`/trips/${tripId}/collaborators/${userId}`);
