import api from './axios';
export const getExpenses = (tripId) => api.get(`/trips/${tripId}/expenses`);
export const addExpense = (tripId, data) => api.post(`/trips/${tripId}/expenses`, data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
