/**
 * Google Sign-In Redirect
 *
 * Redirects the browser to the backend's Google OAuth endpoint.
 * The backend URL is configurable via VITE_BACKEND_URL env var.
 * Falls back to the production Render URL if not set.
 */
export const loginWithGoogle = () => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "https://finlearn-1.onrender.com";
  window.location.href = `${backendUrl}/auth/google`;
};
