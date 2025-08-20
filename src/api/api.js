import axios from "axios";
import { auth } from "../services/authService";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

// важливо: async дозволено — повертаємо Promise<config>
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    config.headers = config.headers || {};
    if (user) {
        const t = await user.getIdToken(); // авто-рефреш
        config.headers.Authorization = `Bearer ${t}`;
        localStorage.setItem("token", t);
    } else {
        delete config.headers.Authorization;
    }
    return config;
});

export default api;
