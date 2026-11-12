import React, { useEffect, useState, useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./auth.css";
import {
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import { MdOutlineVerified } from "react-icons/md";
import { ArrowBack } from "@mui/icons-material";
import Countdown from "react-countdown";
import useGeneral from "../../hooks/useGeneral";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

const Verification = () => {
  const { navigate, loading, setLoading } = useGeneral();
  const [userEmail, setUserEmail] = useState("");
  const [endTime, setEndTime] = useState(0);

  const initialState = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const validationSchema = Yup.object({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
  });

  // Recover the email and expiry returned by the public password-reset request.
  const loadOtpTime = useCallback(() => {
    const email = sessionStorage.getItem("passwordResetEmail") || "";
    const expiresAt = Number(sessionStorage.getItem("passwordResetExpiresAt"));
    setUserEmail(email);
    const remaining = Number.isFinite(expiresAt) ? Math.max(0, expiresAt - Date.now()) : 0;
    setEndTime(Date.now() + remaining);
  }, []);

  useEffect(() => {
    let active = true;
    const email = sessionStorage.getItem("passwordResetEmail");
    if (!email) {
      toast.error("Please enter your registered email first");
      navigate("/auth/password/forgot", { replace: true });
      return;
    }
    loadOtpTime();
    const timer = setTimeout(() => {
      if (!active) return;
      const first = document.getElementById("otp-1");
      if (first) first.focus();
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadOtpTime, navigate]);

  // Auto shift to next input
  const handleOtpChange = (value, setFieldValue, field, index) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setFieldValue(field, cleaned);

    if (cleaned && index < 6) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  // Support pasting full 6-digit OTP into any field
  const handlePaste = (e, setFieldValue) => {
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      e.preventDefault();
      pasteData.split("").forEach((char, idx) => {
        setFieldValue(`otp${idx + 1}`, char);
      });
      const lastInput = document.getElementById("otp-6");
      if (lastInput) lastInput.focus();
    }
  };

  // FIXED SUBMIT HANDLER
  const submitHandler = async (values) => {
    if (!userEmail) {
      toast.error("Start password reset by entering your email first");
      navigate("/auth/password/forgot");
      return;
    }

    const code =
      (values.otp1 ?? "") +
      (values.otp2 ?? "") +
      (values.otp3 ?? "") +
      (values.otp4 ?? "") +
      (values.otp5 ?? "") +
      (values.otp6 ?? "");

    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    const payload = {
      url: apis().verifyOtp,
      method: "POST",
      body: { email: userEmail, otp: Number(code) },
      timeout: 12000,
      retries: 0,
    };

    setLoading(true);
    try {
      const result = await httpAction(payload);
      if (result?.status) {
        sessionStorage.setItem("passwordResetToken", result.resetToken);
        toast.success(result.message || "OTP verified!");
        navigate("/auth/password/change");
      } else {
        toast.error(result?.message || "Invalid or expired OTP");
      }
    } catch (error) {
      toast.error(error?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const resendOtpHandler = async () => {
    if (!userEmail) {
      toast.error("Start password reset by entering your email first");
      navigate("/auth/password/forgot");
      return;
    }

    const payload = {
      url: apis().forgetPassword,
      method: "POST",
      body: { email: userEmail },
      timeout: 12000,
      retries: 0,
    };

    setLoading(true);
    try {
      const result = await httpAction(payload);
      if (result?.status) {
        sessionStorage.removeItem("passwordResetToken");
        sessionStorage.setItem("passwordResetExpiresAt", String(result.expiresAt));
        toast.success(result.message || "OTP resent!");
        loadOtpTime();
      } else {
        toast.error(result?.message || "Could not resend the code");
      }
    } catch (error) {
      toast.error(error?.message || "Could not resend the code");
    } finally {
      setLoading(false);
    }
  };

  const otpFields = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"];

  return (
    <Formik
      initialValues={initialState}
      onSubmit={submitHandler}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <div className="w-full flex flex-col gap-6">

            {/* HEADER */}
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-sm">
                <MdOutlineVerified className="text-2xl" />
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-gray-800">Verify OTP</h2>
              <p className="text-gray-500 text-sm">
                Enter the 6-digit code sent to <span className="font-medium text-gray-700">{userEmail || "your email"}</span>
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-lg text-center mt-2">
                💡 If you received more than one email, please use the code from the <strong>latest email</strong>.
              </div>
            </div>

            {/* OTP BOXES */}
            <div className="flex justify-between gap-3" onPaste={(e) => handlePaste(e, setFieldValue)}>

              {otpFields.map((field, index) => (
                <TextField
                  key={field}
                  id={`otp-${index + 1}`}
                  value={values[field]}
                  inputProps={{
                    maxLength: 1,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center" },
                  }}
                  onChange={(e) =>
                    handleOtpChange(e.target.value, setFieldValue, field, index + 1)
                  }
                  size="small"
                  className="w-12"
                />
              ))}

            </div>

            {/* VERIFY BUTTON */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              endIcon={loading && <CircularProgress size={16} />}
              className="bg-indigo-600! text-white! rounded-lg!"
            >
              Verify OTP
            </Button>

            {/* BACK TO LOGIN */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/auth/login")}
              className="rounded-lg!"
            >
              Back to login
            </Button>

            {/* TIMER / RESEND */}
            <div className="text-center">
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <Countdown
                  date={endTime}
                  renderer={({ minutes, seconds, completed }) =>
                    completed ? (
                      <Button onClick={resendOtpHandler} variant="text">
                        Resend OTP
                      </Button>
                    ) : (
                      <span className="text-gray-600">
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                      </span>
                    )
                  }
                />
              )}
            </div>

          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Verification;
