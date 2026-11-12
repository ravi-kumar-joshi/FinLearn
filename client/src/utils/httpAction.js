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
 * Fix applied:
 *   #9  - refreshPromise is now backed by an explicit Promise constructor so
 *         the module-level variable is always cleared in the finally block,
 *         even if the async IIFE throws synchronously. The old pattern had a
 *         window where a synchronous throw inside the IIFE could leave
 *         refreshPromise pointing to a settled (but not-yet-nulled) promise,
 *         causing all subsequent concurrent callers to re-use a dead promise.
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
async function doFetch(url, method, body, timeoutMs = 25000, headers = {}) {
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
      headers: { "Content-Type": "application/json", ...headers },
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
 * FIX #9: Attempt to refresh the access token via the refreshToken cookie.
 *
 * Uses an explicit Promise constructor instead of wrapping an async IIFE.
 * This guarantees refreshPromise is set to null in the finally block even
 * when the inner code throws synchronously, closing the race window that
 * existed in the previous implementation.
 *
 * Returns true on success, false on failure (caller should redirect to login).
 */
function attemptRefresh() {
  // Coalesce concurrent 401s into a single refresh request.
  if (refreshPromise) return refreshPromise;

  refreshPromise = new Promise((resolve) => {
    const { controller, timer } = makeTimeout(15000);

    // Inline IIFE so we can use async/await inside the Promise constructor.
    (async () => {
      try {
        const isDev = import.meta.env.MODE === "development";
        const base = isDev ? "http://localhost:5050/" : "/api/";
        const res = await fetch(`${base}user/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timer);
        resolve(res.ok);
      } catch {
        // Network error or timeout — treat as refresh failure.
        clearTimeout(timer);
        resolve(false);
      } finally {
        // FIX #9: Always clear the module-level guard so future calls
        // can initiate a new refresh request.
        refreshPromise = null;
      }
    })();
  });

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
 * @param {Object}  [data.headers]     - Additional request headers
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

      return await doFetch(data.url, method, data.body, timeoutMs, data.headers);
    } catch (err) {
      lastError = err;

      // ── 401: attempt transparent token refresh (once) ──────────────
      if (err.status === 401 && attempt === 0) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          // Retry the original request with the new access token cookie
          try {
            return await doFetch(data.url, method, data.body, timeoutMs, data.headers);
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

      // ── 403: forbidden — handled by redirect in caller ─────────────
      if (err.status === 403) {
        if (data.surfaceError) {
          return {
            status: false,
            message: err.message || "You are not allowed to do that",
          };
        }
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

  const failureMessage = !lastError
    ? "Something went wrong"
    : lastError.isNetworkError
      ? (lastError.message || "Network error — please check your connection")
      : lastError.status >= 500
        ? "Server is temporarily unavailable. Please try again."
        : lastError.message?.includes("Google Sign-In")
          ? "This account was registered with Google. Please use 'Continue with Google' to log in."
          : (lastError.message || "Something went wrong");

  // ── All retries exhausted — surface error to user ─────────────────
  if (!data.silent && lastError) {
    toast.error(failureMessage);
  }

  if (data.surfaceError) {
    return { status: false, message: failureMessage };
  }

  if (import.meta.env.MODE === "development") {
    console.error("🔴 HTTP Error:", lastError?.message, lastError);
  }

  return null;
};

export default httpAction;
