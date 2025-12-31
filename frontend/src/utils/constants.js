// If we are in development, it uses the Vite proxy (/api)
// If we are in production, it uses the environment variable you set in Render/Vercel
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";

export const USERS_URL = `${BASE_URL}/users`;
export const DEVICES_URL = `${BASE_URL}/devices`;
export const AI_URL = `${BASE_URL}/ai`;
export const ECO_URL = `${BASE_URL}/eco-products`;
