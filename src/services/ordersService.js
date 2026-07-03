import api from "./api";

export const getOrders = () => api.get("/orders");

export const getOrder = (id) => api.get(`/orders/${id}`);

export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export const deleteAllOrders = () => api.delete("/orders");

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
