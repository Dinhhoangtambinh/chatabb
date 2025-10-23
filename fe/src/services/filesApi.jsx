import api from "./api";

const BasePrefix = "/files";

const filesApi = {
  upload: ({ file, filetype, conversation_id, message_id }, token) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filetype", filetype);
    formData.append("conversation_id", conversation_id);
    if (message_id) formData.append("message_id", message_id);

    return api.post(`${BasePrefix}/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getByConversationId: (conversationId, token) =>
    api.get(`${BasePrefix}/conversation/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default filesApi;
