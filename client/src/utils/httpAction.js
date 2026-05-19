/**
 * HTTP Request Utility
 * 
 * Centralized fetch wrapper for making API requests
 * Handles errors and displays toast notifications
 * 
 * @module utils/httpAction
 * @param {Object} data - Request configuration
 * @param {string} data.url - API endpoint URL
 * @param {string} [data.method='GET'] - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} [data.body] - Request body (will be JSON stringified)
 * @returns {Promise<Object>} Response data from API
 * 
 * @example
 * const result = await httpAction({
 *   url: 'http://localhost:5050/user/login',
 *   method: 'POST',
 *   body: { email: 'user@example.com', password: 'password123' }
 * });
 */

import toast from "react-hot-toast";

const httpAction = async (data) => {
  try {
    // Validate required parameters
    if (!data.url) {
      throw new Error("URL is required for HTTP request");
    }

    // Make fetch request with credentials (cookies)
    const response = await fetch(data.url, {
      method: data.method || "GET",
      body: data.body ? JSON.stringify(data.body) : null,
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // Include cookies for authentication
    });

    // Parse response as JSON
    const result = await response.json();

    // Handle HTTP errors (4xx, 5xx)
    if (!response.ok) {
      const status = response.status;
      const error = new Error(result?.message || "Request failed");
      error.status = status;
      throw error;
    }

    // Return successful response
    return result;

  } catch (error) {
    // Don't show toast for 403 (unauthorized) - handled by redirect
    if (error?.status !== 403) {
      // Special handling for Google account login errors
      if (error.message?.includes("Google Sign-In")) {
        toast.error("This account was registered with Google. Please use 'Continue with Google' to log in.");
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }

    // Log error for debugging
    if (import.meta.env.MODE === 'development') {
      console.error('🔴 HTTP Error:', error.message);
    }

    // Return null on error (caller should check for null)
    return null;
  }
};

export default httpAction;
