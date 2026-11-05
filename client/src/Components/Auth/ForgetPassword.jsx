import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./auth.css";
import useGeneral from "../../hooks/useGeneral";
import { TextField, Button, InputAdornment, CircularProgress } from "@mui/material";
import { FaArrowRotateRight } from "react-icons/fa6";
import { ArrowBack, Send } from "@mui/icons-material";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

const ForgetPassword = () => {
  const { navigate, loading, setLoading } = useGeneral();
  const [errorMessage, setErrorMessage] = useState("");
  const submitLock = useRef(false);

  const initialState = { email: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const submitHandler = async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    const email = values.email.trim().toLowerCase();
    const data = {
      url: apis().forgetPassword,
      method: "POST",
      body: { email },
      silent: true,
      surfaceError: true,
    };
    setErrorMessage("");
    setLoading(true);
    try {
      const result = await httpAction(data);
      if (result?.status) {
        sessionStorage.removeItem("passwordResetToken");
        sessionStorage.setItem("passwordResetEmail", email);
        sessionStorage.setItem("passwordResetExpiresAt", String(result.expiresAt));
        toast.success(result?.message || "OTP sent");
        navigate("/auth/otp/verify");
      } else {
        setErrorMessage(result?.message || "Could not send a reset code. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error?.message || "Could not send a reset code. Please try again.");
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={submitHandler}>
        {({ handleBlur, handleChange, values, touched, errors }) => (
          <Form>
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-yellow-50 text-yellow-600 shadow-sm">
                  <FaArrowRotateRight className="text-2xl" />
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-gray-800">Find your account</h2>
                <p className="text-gray-500 text-sm">Enter your registered email</p>
              </div>

              {errorMessage ? (
                <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
              ) : null}

              <TextField
                label="Registered Email"
                name="email"
                type="email"
                fullWidth
                size="small"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: <InputAdornment position="start" />,
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={18} /> : <Send />}
                className="bg-teal-600! text-white! rounded-lg!"
              >
                Send OTP
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/auth/login")}
                className="rounded-lg!"
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
