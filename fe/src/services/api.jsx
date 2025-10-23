import axios from 'axios';

let isRedirecting = false;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            if (status === 401 && !isRedirecting) {
                isRedirecting = true;
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default api;