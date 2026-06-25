import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9091/api",
  withCredentials: true, // Crucial for HttpOnly cookies authentication
});

export default api;
