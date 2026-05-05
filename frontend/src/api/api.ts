import axios from "axios";

export const API = axios.create({
  // Change this to your local backend URL
  baseURL: "https://service_agent.vishalkumar-9ca.workers.dev/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: If you are using user authentication, keep this interceptor 
// to automatically attach the token to every request.
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsedUser = JSON.parse(user);
    if (parsedUser.token) {
      req.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
  }
  return req;
});