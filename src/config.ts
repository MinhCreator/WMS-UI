/**
 * Screens that still render sample data advertise it with a "demo" badge.
 * Set VITE_DEMO_DATA=false once every screen is wired to the API.
 */
export const demoDataEnabled = import.meta.env.VITE_DEMO_DATA !== "false";
