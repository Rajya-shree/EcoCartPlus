// If we are in development, it uses the Vite proxy (/api)
// If we are in production, it uses the environment variable you set in Render/Vercel
//export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";
// frontend/src/utils/constants.js
// export const BASE_URL =
//   import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
// Ensure this points to port 5000 to match your index.js
export const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// export const USERS_URL = `${BASE_URL}/auth`;
// export const DEVICES_URL = `${BASE_URL}/devices`;
// export const AI_URL = `${BASE_URL}/ai`;
// export const ECO_URL = `${BASE_URL}/eco-products`;
// export const TASKS_URL = `${BASE_URL}/tasks`;

// 1. User & Authentication
export const AUTH_URL = `${BASE_URL}/auth`;
export const REGISTER_URL = `${AUTH_URL}/register`; // Now this exists!
export const LOGIN_URL = `${AUTH_URL}/login`;

// 2. Device Lifecycle & Maintenance
export const LIFECYCLE_URL = `${BASE_URL}/lifecycle`;
export const TASKS_URL = `${BASE_URL}/tasks`;
export const NOTIFICATIONS_URL = `${BASE_URL}/notifications`;

// 3. AI Diagnosis & Repair Guides
export const DIAGNOSIS_URL = `${BASE_URL}/diagnosis`; // Groq Powered
export const IFIXIT_URL = `${BASE_URL}/ifixit`; // iFixit API Proxy

// 4. Green Shopping & Eco-Products
export const GREEN_SHOPPING_URL = `${BASE_URL}/green-shopping`;

// 5. New Gemini-Powered Features
export const VIDEO_RECOMMENDATIONS_URL = `${BASE_URL}/video-recommendations`;
export const SHOP_LOCATOR_URL = `${BASE_URL}/shop-locator`;
