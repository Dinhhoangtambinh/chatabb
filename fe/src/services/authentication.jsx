import api from "./api";

const BasePrefix = "/auth";

const authApi = {
  register: (data) => api.post(`${BasePrefix}/register`, data),

  login: ({ username, password }) =>
    api.post(
      `${BasePrefix}/login`,
      new URLSearchParams({ username, password }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    ),

  getCurrentUser: (token) =>
    api.get(`${BasePrefix}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default authApi;
