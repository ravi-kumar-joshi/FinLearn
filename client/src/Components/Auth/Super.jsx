

import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import "./auth.css";

const Super = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  // Get current route location
  const location = useLocation();

  /**
   * Authentication Check Effect
   * 
   * Runs on component mount and when route changes
   * Verifies JWT token and checks onboarding status
   */
  useEffect(() => {
    const access = async () => {
      // Prepare API request
      const data = {
        url: apis().getAccess,
      };

      setLoading(true);

      // Call authentication endpoint
      const result = await httpAction(data);

      if (result?.status) {
        // User is authenticated
        setIsAuth(true);
        setOnboardingCompleted(result.onboardingCompleted || false);
      } else {
        // Authentication failed
        setIsAuth(false);
      }

      setLoading(false);
    };

    access();
  }, [location.pathname]); // Re-check when location changes

  // Show loading spinner while checking authentication
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

  // Redirect to login if not authenticated
  if (!isAuth) {
    return <Navigate to="/auth/login" replace />;
  }

  /**
    Onboarding Check
    If user hasn't completed onboarding and isn't already on onboarding page,
    redirect to onboarding
   */
  if (!onboardingCompleted && !location.pathname.includes("/auth/onboarding")) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  // User is authenticated and has completed onboarding - render child routes
  return <Outlet />;
};

export default Super;
