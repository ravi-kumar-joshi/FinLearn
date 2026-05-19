import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "./auth.css";
import useGeneral from "../../hooks/useGeneral";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { IoMdPersonAdd } from "react-icons/io";
import { ArrowBack, Google, Visibility, VisibilityOff } from "@mui/icons-material";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import { loginWithGoogle } from "../../utils/loginWithGoogle";
import toast from "react-hot-toast";

const Register = () => {
  const [visible, setVisible] = useState(false);
  const { navigate, loading, setLoading } = useGeneral();

  const initialState = { name: "", email: "", password: "" };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Min 6 chars").required("Password is required"),
  });

  const submitHandler = async (values) => {
    const data = { url: apis().registerUser, method: "POST", body: values };
    setLoading(true);
    const result = await httpAction(data);
    setLoading(false);
    if (result?.status) {
      toast.success(result?.message || "Registered successfully! Please login.");
      // Redirect to login - onboarding will show after login
      navigate("/auth/login");
    }
  };

  return (
    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={submitHandler}>
      {({ handleBlur, handleChange, errors, touched, values }) => (
        <Form>
          <div className="w-full flex flex-col gap-6">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-green-50 text-teal-600 shadow-sm">
                <IoMdPersonAdd className="text-2xl" />
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-gray-800">Create account</h2>
              <p className="text-gray-500 text-sm">Sign up to get started</p>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Full name"
                name="name"
                fullWidth
                size="small"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

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
                type={visible ? "text" : "password"}
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
                      <IconButton onClick={() => setVisible(!visible)}>
                        {visible ? <VisibilityOff /> : <Visibility />}
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
                Sign up
              </Button>

              <Divider className="my-1!">OR</Divider>

              <Button
                fullWidth
                variant="outlined"
                onClick={loginWithGoogle}
                endIcon={<Google />}
                className="rounded-lg!"
              >
                Continue with Google
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                onClick={() => navigate("/auth/login")}
                className="rounded-lg!"
              >
                Back to login
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Register;
