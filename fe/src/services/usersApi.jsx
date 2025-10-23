import api from "./api";

const BasePrefix = "/users";

const usersApi = {
  getByUsername: (username, token) =>
    api.get(`${BasePrefix}/${username}`, {
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
};

export default usersApi;
