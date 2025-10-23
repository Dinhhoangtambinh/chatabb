import api from "./api";

const BasePrefix = "/messages";

const messagesApi = {
  getByConversationId: (conversationId, token) =>
    api.get(`${BasePrefix}/conversation/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  create: (data, token) =>
    api.post(`${BasePrefix}/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  delete: (messageId, token) =>
    api.delete(`${BasePrefix}/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default messagesApi;
