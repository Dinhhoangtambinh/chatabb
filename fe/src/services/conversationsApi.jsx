import api from "./api";

const BasePrefix = "/conversations";

const conversationsApi = {
  getAll: (token) =>
    api.get(`${BasePrefix}/`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (conversationId, token) =>
    api.get(`${BasePrefix}/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (data, token) =>
    api.post(`${BasePrefix}/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (conversationId, data, token) =>
    api.put(`${BasePrefix}/${conversationId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (conversationId, token) =>
    api.delete(`${BasePrefix}/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  sendMessage: (conversationId, { content, files }, token) => {
    const formData = new FormData();
    if (content) formData.append("content", content);
    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    return api.post(`${BasePrefix}/${conversationId}/messages/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default conversationsApi;
