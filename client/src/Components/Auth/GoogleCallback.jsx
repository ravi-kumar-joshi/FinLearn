/**
 * GoogleCallback – OAuth Token Exchange Handler
 *
 * This component handles the return from Google OAuth.
 * The server-side Google callback redirects to:
 *   /auth/google/callback?code=<exchangeCode>&new=1&onboarded=1
 *
 * This component:
 * 1. Reads the `code` from the URL
 * 2. Sends it to /api/user/set-token-cookies (through Vercel proxy)
 *    — this sets the auth cookies on the Vercel domain (not Render)
 * 3. Redirects to /dashboard or /auth/onboarding based on user status
 *
 * Without this exchange step, cookies set on finlearn-1.onrender.com
 * would never reach fin-learn-client-ttsd.vercel.app (cross-domain issue).
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const exchangeCode = async () => {
            const code = searchParams.get("code");
            const onboarded = searchParams.get("onboarded");

            if (!code) {
                setError("Missing exchange code — please try Google sign-in again.");
                setTimeout(() => navigate("/auth/login", { replace: true }), 3000);
                return;
            }

            // Exchange the short-lived code for proper cookies via Vercel proxy
            const result = await httpAction({
                url: apis().setTokenCookies,
                method: "POST",
                body: { code },
                silent: true,
            });

            if (result?.status) {
                // Redirect based on onboarding status
                const onboardingCompleted =
                    result.user?.onboardingCompleted || onboarded === "1";
                navigate(
                    onboardingCompleted ? "/dashboard" : "/auth/onboarding",
                    { replace: true }
                );
            } else {
                setError("Google sign-in failed — please try again.");
                setTimeout(() => navigate("/auth/login", { replace: true }), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">{error}</div>
                    <p className="text-gray-500 text-sm">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <span className="text-gray-600">Completing Google sign-in...</span>
            </div>
        </div>
    );
};

export default GoogleCallback;
