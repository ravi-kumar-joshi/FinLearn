import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./auth.css";
import { TextField, Button, CircularProgress } from "@mui/material";
import { MdOutlineUpdate } from "react-icons/md";
import { ArrowBack } from "@mui/icons-material";
import useGeneral from "../../hooks/useGeneral";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

const NewPassword = () => {
  const { navigate, loading, setLoading } = useGeneral();
  const [errorMessage, setErrorMessage] = useState("");

  const initialState = { password: "" };

  const validationSchema = Yup.object({
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  });

  const submitHandler = async (values) => {
    const resetToken = sessionStorage.getItem("passwordResetToken");
    if (!resetToken) {
      toast.error("Please verify your password reset code first");
      navigate("/auth/password/forget");
      return;
    }
    const data = {
      url: apis().updatePassword,
      method: "POST",
      headers: { Authorization: `Bearer ${resetToken}` },
      body: { password: values.password },
      silent: true,
      surfaceError: true,
    };
    setErrorMessage("");
    setLoading(true);
    try {
      const result = await httpAction(data);
      if (result?.status) {
        sessionStorage.removeItem("passwordResetToken");
        sessionStorage.removeItem("passwordResetEmail");
        sessionStorage.removeItem("passwordResetExpiresAt");
        toast.success(result.message || "Password updated");
        navigate("/auth/login");
      } else {
        setErrorMessage(result?.message || "Could not update the password. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error?.message || "Could not update the password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={submitHandler}>
      {({ handleBlur, handleChange, values, errors, touched }) => (
        <Form>
          <div className="w-full flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-sm">
                <MdOutlineUpdate className="text-2xl" />
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-gray-800">Change password</h2>
              <p className="text-gray-500 text-sm">Create a new password</p>
            </div>

            {errorMessage ? (
              <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
            ) : null}

            <TextField
              label="New Password"
              name="password"
              type="password"
              fullWidth
              size="small"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              endIcon={loading && <CircularProgress size={16} />}
              className="bg-indigo-600! text-white! rounded-lg!"
            >
              Change password
            </Button>

            <Button variant="outlined" fullWidth startIcon={<ArrowBack />} onClick={() => navigate("/auth/login")}>
              Back to login
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NewPassword;
