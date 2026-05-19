/**
 * useGeneral Hook
 * 
 * Custom React hook providing common utilities used across components
 * - Navigation function (React Router)
 * - Loading state management
 * 
 * @module hooks/useGeneral
 * @returns {Object} Object containing navigate function and loading state
 * 
 * @example
 * const { navigate, loading, setLoading } = useGeneral();
 * 
 * // Navigate to a route
 * navigate('/dashboard');
 * 
 * // Show loading state
 * setLoading(true);
 * await someAsyncOperation();
 * setLoading(false);
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useGeneral = () => {
  // React Router navigation
  const navigate = useNavigate();

  // Loading state for async operations
  const [loading, setLoading] = useState(false);

  return {
    navigate,     // Function to navigate programmatically
    loading,      // Boolean: true when async operation in progress
    setLoading,   // Function to update loading state
  };
};

export default useGeneral;
