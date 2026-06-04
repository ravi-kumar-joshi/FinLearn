/**
 * HTTP Request Utility (Android-Resilient)
 *
 * Centralized fetch wrapper designed for cross-domain auth and mobile
 * network reliability.  Key features for Android compatibility:
 *
 * 1. AbortController timeout — prevents requests hanging forever on flaky
 *    3G/4G transitions or when Android kills a background tab's network.
 *
 * 2. Exponential-backoff retry — retries on network errors, 429, 502, 503,
 *    504 (transient conditions). Does NOT retry 4xx client errors (except
 *    401 which triggers token refresh).
 *
 * 3. Transparent token refresh — on 401 Unauthorized the wrapper attempts
 *    a single /user/refresh-token call, then replays the original request.
 *    Prevents random logouts when the access token expires on mobile.
 *
 * 4. Network-aware error messages — distinguishes "no internet" from
 *    "server error" so the user sees helpful toasts.
 *
 * @module utils/httpAction
 */
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// Module-level guard: only one token refresh at a time.
// If multiple concurrent requests receive 401 simultaneously,
// the first one triggers the refresh; the rest queue behind it.
// ─────────────────────────────────────────────────────────────
let refreshPromise = null;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const isOnline = () =>
  typeof navigator !== "undefined" ? navigator.onLine : true;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Build an AbortController that fires after `ms` milliseconds.
 * Caller should always call `clearTimeout` on the returned timer.
 */
const makeTimeout = (ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
};

/**
 * Single fetch attempt with timeout.
 * Throws on network error or non-2xx status.
 */
async function doFetch(url, method, body, timeoutMs = 25000) {
  if (!isOnline()) {
    const err = new Error("No internet connection — please check your network");
    err.isNetworkError = true;
    throw err;
  }

  const { controller, timer } = makeTimeout(timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // send HttpOnly auth cookies
      signal: controller.signal,
    });

    // Parse JSON — some error responses may be non-JSON (e.g. 502 gateway HTML)
    let result;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = { message: `Unexpected response (${response.status})` };
    }

    if (!response.ok) {
      const err = new Error(result?.message || "Request failed");
      err.status = response.status;
      err.result = result;
      throw err;
    }
    return result;
  } catch (err) {
    // AbortController timeout → treat as network error
    if (err.name === "AbortError") {
      const timeoutErr = new Error(
        "Request timed out — your connection may be slow"
      );
      timeoutErr.isNetworkError = true;
      throw timeoutErr;
    }
    // fetch TypeError (network failure, DNS, CORS)
    if (err instanceof TypeError) {
      err.isNetworkError = true;
      err.message = err.message || "Network error — please try again";
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Attempt to refresh the access token via the refreshToken cookie.
 * Coalesces concurrent calls into a single request.
 * Returns true on success, false on failure (caller should redirect to login).
 */
async function attemptRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Use doFetch but bypass retry/refresh to avoid infinite loops
      const { controller, timer } = makeTimeout(15000);
      try {
        const res = await fetch(
          // We need the URL directly here to avoid circular dependency with apis()
          // apis() uses import.meta.env.MODE which is available at call time.
          (() => {
            const isDev = import.meta.env.MODE === "development";
            const base = isDev ? "http://localhost:5050/" : "/api/";
            return `${base}user/refresh-token`;
          })(),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal: controller.signal,
          }
        );
        clearTimeout(timer);
        return res.ok;
      } catch {
        clearTimeout(timer);
        return false;
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * @param {Object}   data
 * @param {string}   data.url          - API endpoint URL (required)
 * @param {string}  [data.method=GET]  - HTTP method
 * @param {Object}  [data.body]        - JSON body
 * @param {number}  [data.timeout]     - Request timeout in ms (default 25000)
 * @param {number}  [data.retries]     - Max retry count for transient errors (default 2)
 * @param {boolean} [data.silent]      - Suppress toast notifications (default false)
 * @returns {Promise<Object|null>}     Parsed JSON response, or null on failure
 */
const httpAction = async (data) => {
  if (!data?.url) {
    throw new Error("URL is required for HTTP request");
  }

  const method = (data.method || "GET").toUpperCase();
  const maxRetries = data.retries ?? 2;
  const timeoutMs = data.timeout ?? 25000;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Exponential backoff before retry (not before first attempt)
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await sleep(delay);
      }

      return await doFetch(data.url, method, data.body, timeoutMs);
    } catch (err) {
      lastError = err;

      // ── 401: attempt transparent token refresh (once) ──────────────
      if (err.status === 401 && attempt === 0) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          // Retry the original request with the new access token cookie
          try {
            return await doFetch(data.url, method, data.body, timeoutMs);
          } catch (retryErr) {
            lastError = retryErr;
            // fall through to retry loop
          }
        } else {
          // Refresh failed — session is truly dead
          if (!data.silent) {
            toast.error("Your session has expired. Please log in again.");
          }
          return null;
        }
        continue; // continue retry loop after refresh+retry
      }

      // ── 403: unauthorized — handled by redirect in caller ──────────
      if (err.status === 403) {
        // Don't toast or retry — caller (e.g. Super) redirects to /auth/login
        return null;
      }

      // ── Other 4xx client errors: don't retry ───────────────────────
      if (err.status && err.status >= 400 && err.status < 500) {
        break; // exit retry loop
      }

      // ── 5xx / network errors: retry up to maxRetries ──────────────
      // (loop continues naturally)
    }
  }

  // ── All retries exhausted — surface error to user ─────────────────
  if (!data.silent && lastError) {
    if (lastError.isNetworkError) {
      toast.error(lastError.message || "Network error — please check your connection");
    } else if (lastError.status >= 500) {
      toast.error("Server is temporarily unavailable. Please try again.");
    } else if (lastError.message?.includes("Google Sign-In")) {
      toast.error(
        "This account was registered with Google. Please use 'Continue with Google' to log in."
      );
    } else {
      toast.error(lastError.message || "Something went wrong");
    }
  }

  if (import.meta.env.MODE === "development") {
    console.error("🔴 HTTP Error:", lastError?.message, lastError);
  }

  return null;
};

export default httpAction;
