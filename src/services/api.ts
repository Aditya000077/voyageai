import axios from "axios";

export const api = axios.create({
  baseURL: process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api",
});
