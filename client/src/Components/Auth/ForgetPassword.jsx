import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./auth.css";
import useGeneral from "../../hooks/useGeneral";
import {
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FaArrowRotateRight } from "react-icons/fa6";
import { ArrowBack, Send, AccessTime } from "@mui/icons-material";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

const COOLDOWN_DURATION_SEC = 60;

const ForgetPassword = () => {
  const { navigate, loading, setLoading } = useGeneral();
  const [apiError, setApiError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false); // Synchronous double-click guard

  // Initialize and tick the resend cooldown timer
  useEffect(() => {
    const checkCooldown = () => {
      const cooldownUntil = Number(sessionStorage.getItem("passwordResetCooldownUntil") || 0);
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      return remaining;
    };

    const remaining = checkCooldown();
    if (remaining > 0) {
      timerRef.current = setInterval(() => {
        const left = checkCooldown();
        if (left <= 0) {
          clearInterval(timerRef.current);
          sessionStorage.removeItem("passwordResetCooldownUntil");
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initialState = {
    email: sessionStorage.getItem("passwordResetEmail") || "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email address is required"),
  });

  const submitHandler = async (values, { setSubmitting } = {}) => {
    // Synchronous lock: blocks rapid double clicks before React state updates
    if (isSubmittingRef.current || loading || cooldownSeconds > 0) return;
    isSubmittingRef.current = true;

    setApiError(null);

    const email = values.email.trim().toLowerCase();
    const requestData = {
      url: apis().forgetPassword,
      method: "POST",
      body: { email },
      timeout: 12000, // 12s timeout: prevents infinite waiting if connection stalls
      retries: 0,     // 0 retries: avoids burning user's daily OTP attempts
      surfaceError: true,
    };

    setLoading(true);
    try {
      const result = await httpAction(requestData);

      if (result?.status) {
        // Set 60-second cooldown in session to prevent rapid re-submission
        const cooldownExpiry = Date.now() + COOLDOWN_DURATION_SEC * 1000;
        sessionStorage.setItem("passwordResetCooldownUntil", String(cooldownExpiry));
        setCooldownSeconds(COOLDOWN_DURATION_SEC);

        sessionStorage.removeItem("passwordResetToken");
        sessionStorage.setItem("passwordResetEmail", email);
        sessionStorage.setItem("passwordResetExpiresAt", String(result.expiresAt));

        toast.success(result?.message || "OTP code sent to your email!");

        // Navigate to OTP verification only after confirmed successful delivery
        navigate("/auth/otp/verify");
      } else {
        setApiError(
          result?.message ||
            "Unable to send OTP. Please check your internet connection or email address and try again."
        );
      }
    } catch (err) {
      setApiError(err?.message || "Request timed out. Please try again.");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
      if (setSubmitting) setSubmitting(false);
    }
  };

  const isButtonDisabled = loading || cooldownSeconds > 0;

  return (
    <div className="w-full">
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={submitHandler}
        enableReinitialize
      >
        {({ handleBlur, handleChange, values, touched, errors, isSubmitting }) => (
          <Form>
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-yellow-50 text-yellow-600 shadow-sm">
                  <FaArrowRotateRight className="text-2xl" />
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-gray-800">Find your account</h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email to receive a 6-digit verification code.
                </p>
              </div>

              {/* Accessible inline error banner */}
              {apiError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  <Typography variant="body2" className="font-medium">
                    {apiError}
                  </Typography>
                </div>
              )}

              {/* Cooldown notice */}
              {cooldownSeconds > 0 && !loading && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
                  <AccessTime fontSize="small" />
                  <span>
                    Please wait <strong>{cooldownSeconds}s</strong> before requesting another OTP.
                  </span>
                </div>
              )}

              {/* Input field */}
              <TextField
                label="Registered Email"
                name="email"
                type="email"
                fullWidth
                size="small"
                disabled={loading}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}
              />

              {/* Action button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isButtonDisabled || isSubmitting}
                endIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : cooldownSeconds > 0 ? (
                    <AccessTime />
                  ) : (
                    <Send />
                  )
                }
                className="bg-teal-600! text-white! rounded-lg! py-2.5 font-medium shadow-sm transition-all hover:bg-teal-700!"
              >
                {loading
                  ? "Sending OTP..."
                  : cooldownSeconds > 0
                  ? `Resend available in ${cooldownSeconds}s`
                  : "Send OTP"}
              </Button>

              {/* Back to login */}
              <Button
                fullWidth
                variant="outlined"
                disabled={loading}
                startIcon={<ArrowBack />}
                onClick={() => navigate("/auth/login")}
                className="rounded-lg! py-2 text-gray-700!"
              >
                Back to login
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgetPassword;
