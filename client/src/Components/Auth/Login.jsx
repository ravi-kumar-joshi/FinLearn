/** Login Component
 * 
 * User authentication form with email and password
 * Supports both traditional login and Google OAuth
 * 
 * Features:
 * - Form validation using Formik and Yup
 * - Password visibility toggle
 * - Google Sign-In integration
 * - Automatic redirect to onboarding or dashboard
 * - Loading states and error handling
 * 
 * @component
 */

import React, { useState } from "react";
// Form handling libraries
import { Formik, Form } from "formik";
import * as Yup from "yup";
// Styles
import "./auth.css";
// Custom hooks
import useGeneral from "../../hooks/useGeneral";
// Material-UI components
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
// Icons
import { IoIosLogIn } from "react-icons/io";
import { ArrowBack, Google, Visibility, VisibilityOff } from "@mui/icons-material";
// API utilities
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import { loginWithGoogle } from "../../utils/loginWithGoogle";

const Login = () => {
  // State for password visibility toggle
  const [show, setShow] = useState(false);

  // Custom hook for navigation and loading state
  const { navigate, loading, setLoading } = useGeneral();

  // Initial form values
  const initialState = { email: "", password: "" };

  /**
   * Form Validation Schema
   * Validates email format and required fields
   */
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  /**
   * Form Submit Handler
   * 
   * Authenticates user and redirects based on onboarding status
   * - New users or incomplete onboarding -> /auth/onboarding
   * - Existing users with completed onboarding -> /dashboard
   */
  const submitHandler = async (values) => {
    const data = {
      url: apis().loginUser,
      method: "POST",
      body: values
    };

    setLoading(true);
    const result = await httpAction(data);
    setLoading(false);

    if (result?.status) {
      // Check onboarding status from login response
      if (result.user?.onboardingCompleted === false) {
        navigate("/auth/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
    // Error handling is done in httpAction utility
  };

  return (
    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={submitHandler}>
      {({ handleBlur, handleChange, errors, touched, values }) => (
        <Form>
          <div className="w-full flex flex-col gap-6">

            {/* Header */}
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-sm">
                <IoIosLogIn className="text-2xl" />
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4">
              <TextField
                label="Email"
                name="email"
                fullWidth
                size="small"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <TextField
                label="Password"
                name="password"
                type={show ? "text" : "password"}
                fullWidth
                size="small"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow(!show)}>
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                endIcon={loading && <CircularProgress size={18} />}
                className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg py-2 shadow-md"
              >
                Login
              </Button>

              <Divider className="my-1!">OR</Divider>

              <Button
                fullWidth
                variant="outlined"
                onClick={loginWithGoogle}
                endIcon={<Google className="text-red-500" />}
                className="rounded-lg!"
              >
                Continue with Google
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                onClick={() => navigate("/auth/register")}
                className="rounded-lg!"
              >
                Create new account
              </Button>

              <Button
                variant="text"
                fullWidth
                onClick={() => navigate("/auth/password/forgot")}

              >
                <p className="text-red-400">Forgot password?</p>
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Login;
