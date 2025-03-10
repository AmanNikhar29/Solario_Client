import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./LoginPage/Login";
import ForgotPassword from "./Password_js/forPassPage";
import OtpVerification from "./Password_js/otpVeri";
import ResetPassword from "./Password_js/resetPass";
 // Global styles

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login Page (Default Route) */}
        <Route path="/" element={<Login />} />

        {/* Forgot Password Page */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* OTP Verification Page */}
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Reset Password Page */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
