/** Empty string = same-origin (Vite proxy in dev, or reverse proxy in production). */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
