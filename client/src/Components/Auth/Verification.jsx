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
  const [otpTime, setOtpTime] = useState(2 * 60 * 1000);
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

  // Fetch OTP expiry time + user email
  const loadOtpTime = useCallback(async () => {
    const config = { url: apis().getOtpExpTime };
    setLoading(true);
    const result = await httpAction(config);
    setLoading(false);

    if (result?.status) {
      setOtpTime(result.time);
      setUserEmail(result.email);
      setEndTime(Date.now() + result.time);
    }
  }, [setLoading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOtpTime();
    setTimeout(() => {
      const first = document.getElementById("otp-1");
      if (first) first.focus();
    }, 150);
  }, [loadOtpTime]);

  // Auto shift to next input
  const handleOtpChange = (value, setFieldValue, field, index) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setFieldValue(field, cleaned);

    if (cleaned && index < 6) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  // FIXED SUBMIT HANDLER
  const submitHandler = async (values) => {
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
      body: { otp: Number(code) }, // FIXED: send as NUMBER
    };

    setLoading(true);
    const result = await httpAction(payload);
    setLoading(false);

    if (result?.status) {
      toast.success(result.message || "OTP verified!");
      navigate("/auth/password/change");
    } else {
      toast.error(result?.message || "Invalid OTP");
    }
  };

  // RESEND OTP
  const resendOtpHandler = async () => {
    const payload = {
      url: apis().forgetPassword,
      method: "POST",
      body: { email: userEmail },
    };

    setLoading(true);
    const result = await httpAction(payload);
    setLoading(false);

    if (result?.status) {
      toast.success(result.message || "OTP resent!");
      loadOtpTime();
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
              <p className="text-gray-500 text-sm">Enter the 6-digit code sent to your email</p>
            </div>

            {/* OTP BOXES */}
            <div className="flex justify-between gap-3">

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
