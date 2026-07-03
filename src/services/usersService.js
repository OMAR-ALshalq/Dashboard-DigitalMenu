import api from "./api";

export const getUsers = () => api.get("/users");

export const getUser = (id) => api.get(`/users/${id}`);

export const createUser = (userData) => api.post("/users", userData);

export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

export const deleteUser = (id) => api.delete(`/users/${id}`);
