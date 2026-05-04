import axios from "axios";

export const API = axios.create({
  // Replace this with your Cloudflare Worker URL in production
  baseURL: "http://127.0.0.1:8787/api", 
  headers: {
    "Content-Type": "application/json",
  },
});