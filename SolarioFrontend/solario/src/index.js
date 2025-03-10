import "./global.css";
import React from "react";
import ReactDOM from "react-dom/client"; // Import from react-dom/client
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./AuthPage/JS/Login";
import ForgotPassword from "./ForgotPass/Password_js/forPassPage";
import OtpVerification from "./ForgotPass/Password_js/otpVeri";
import ResetPassword from "./ForgotPass/Password_js/resetPass";
import Home from "./HomePage/MainPage";
import Register from './AuthPage/JS/Reg';
import Customer from './SellerDash/CustomerDash';
const root = ReactDOM.createRoot(document.getElementById("root"));


root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login Page (Default Route) */}
        <Route path="/" element={<Home />} />

        {/* Forgot Password Page */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* OTP Verification Page */}
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Reset Password Page */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Seller" element={<Customer />} />
      
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);