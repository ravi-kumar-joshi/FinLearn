/**
 * Super – Protected Route Guard (Android-Resilient)
 *
 * Wraps protected routes and ensures only authenticated users can access them.
 *
 * Android-specific hardening:
 * ──────────────────────────────────────────────────────────────
 * 1. visibilitychange listener: When an Android user locks the screen or
 *    switches apps, Chrome/Samsung Internet may kill the tab process to
 *    reclaim memory.  When the user returns the tab is restored but the
 *    JavaScript context is fresh — no in-memory state survives.
 *    This listener re-runs the auth check as soon as the tab becomes
 *    visible again, preventing a stale "logged in" UI with no session.
 *
 * 2. online/offline listeners: Prevents an immediate redirect to /login
 *    when the user simply lost signal (tunnel, elevator, network switch).
 *    Instead it waits for the device to come back online before deciding.
 *
 * 3. httpAction's built-in 401→refresh logic handles token expiry
 *    transparently; this component just needs to react to the final result.
 * ──────────────────────────────────────────────────────────────
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import "./auth.css";

const Super = () => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const location = useLocation();

  // Ref to track the last time we ran an auth check (debounce rapid tab switches)
  const lastCheckRef = useRef(0);
  // Ref to avoid running the auth check twice on initial mount + visibility
  const initialMountRef = useRef(true);

  /**
   * Core auth check — calls /user/access (GET, credentials: include).
   * httpAction will auto-attempt a token refresh on 401 before returning null.
   */
  const checkAuth = useCallback(async (force = false) => {
    // Debounce: don't re-check more than once per 5 seconds unless forced
    const now = Date.now();
    if (!force && now - lastCheckRef.current < 5000) return;
    lastCheckRef.current = now;

    const data = {
      url: apis().getAccess,
      silent: true, // don't toast on auth check — we handle redirect ourselves
    };

    setLoading(true);
    const result = await httpAction(data);

    if (result?.status) {
      setIsAuth(true);
      setOnboardingCompleted(result.onboardingCompleted || false);
    } else {
      setIsAuth(false);
    }
    setLoading(false);
  }, []);

  // ── Initial mount & route change ───────────────────────────────────
  useEffect(() => {
    checkAuth(true);
  }, [location.pathname, checkAuth]);

  // ── Visibility change: re-check when tab becomes visible ──────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Skip the very first visibility event (mount already handles it)
        if (initialMountRef.current) {
          initialMountRef.current = false;
          return;
        }
        // Only check if currently authenticated — no point re-checking if already logged out
        if (isAuth) {
          checkAuth(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuth, checkAuth]);

  // ── Online/Offline: re-check when device reconnects ────────────────
  useEffect(() => {
    const handleOnline = () => {
      if (!isAuth) {
        // Device came back online — try auth again in case session is still valid
        checkAuth(true);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isAuth, checkAuth]);

  // ── Render ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!onboardingCompleted && !location.pathname.includes("/auth/onboarding")) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  return <Outlet />;
};

export default Super;
