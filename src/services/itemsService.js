import api from "./api";

// يمكنك إضافة فلتر التصنيف كـ query string
export const getItems = (categoryId) => {
  const params = categoryId ? { category: categoryId } : {};
  return api.get("/items", { params });
};

export const getItem = (id) => api.get(`/items/${id}`);

export const createItem = (itemData) => api.post("/items", itemData);

export const updateItem = (id, itemData) => api.put(`/items/${id}`, itemData);

export const deleteItem = (id) => api.delete(`/items/${id}`);
