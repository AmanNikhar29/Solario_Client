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
import Customer from './CustDash/CustomerDash';
import Store from './CustDash/Product';
import Pay from './CustDash/Pay';
import Report from './CustDash/Report/Repo';
import Cart from './CustDash/CartPage';
import Fav from './CustDash/Fav';
import { GoogleOAuthProvider } from '@react-oauth/google';
const root = ReactDOM.createRoot(document.getElementById("root"));


root.render(
  <React.StrictMode>
        <GoogleOAuthProvider clientId="717554330174-7vv47vah7e1jb5mqfb49n6th45p8qdtc.apps.googleusercontent.com">
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
        <Route path="/Customer" element={<Customer />} />
        <Route path="/Store/:SellerId" element={<Store />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Payment" element={<Pay />} />
        <Route path="/Report" element={<Report />} />
        <Route path="/Fav" element={<Fav />} />
        
      </Routes>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);