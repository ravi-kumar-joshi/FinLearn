/**
 * ProtectedAdminRoute – Admin-only Route Guard
 *
 * Wraps admin routes and ensures only authenticated users with admin role can access them.
 * Uses the same authentication pattern as Super component but checks for admin role.
 */
import React, { useEffect, useState, useCallback } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";

const ProtectedAdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  /**
   * Core auth check — calls /user/access (GET, credentials: include)
   * Checks if user is authenticated and has admin role
   */
  const checkAuth = useCallback(async () => {
    const data = {
      url: apis().getAccess,
      silent: true,
    };

    setLoading(true);
    const result = await httpAction(data);

    console.log('ProtectedAdminRoute - API Result:', result);
    console.log('ProtectedAdminRoute - isAdmin check:', result?.isAdmin);

    if (result?.status) {
      // Check if user has admin privileges - the backend returns isAdmin as a boolean
      const isAdminUser = result.isAdmin === true;
      console.log('ProtectedAdminRoute - Is admin user:', isAdminUser);
      setIsAdmin(isAdminUser);
    } else {
      console.log('ProtectedAdminRoute - Auth failed:', result);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);

  // Initial mount & route change
  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Verifying admin access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to login if not authenticated or not admin
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
