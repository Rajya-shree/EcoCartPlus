// If we are in development, it uses the Vite proxy (/api)
// If we are in production, it uses the environment variable you set in Render/Vercel
//export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";
// frontend/src/utils/constants.js
// export const BASE_URL =
//   import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  // Ensure this points to port 5000 to match your index.js
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const USERS_URL = `${BASE_URL}/users`;
export const DEVICES_URL = `${BASE_URL}/devices`;
export const AI_URL = `${BASE_URL}/ai`;
export const ECO_URL = `${BASE_URL}/eco-products`;
export const TASKS_URL = `${BASE_URL}/tasks`;
