import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Password_styles//OtpWidgett.css";

const OtpWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get the email from location state

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpVerified, setIsOtpVerified] = useState(false); // Track OTP verification status
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirm password input
  const [error, setError] = useState(""); // Error message
  const inputRefs = useRef(new Array(6).fill(null));

  const handleChange = (index, event) => {
    const value = event.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const sendOTP = async () => {
    if (!email) return alert("Email is required!");
    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert("OTP resent successfully!");
      } else {
        throw new Error(data.error || "Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.message);
    }
  };

  const verifyOTP = async () => {
    try {
      const enteredOtp = otp.join("");
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setIsOtpVerified(true); // OTP verified, show password reset form
        setError("");
      } else {
        throw new Error(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error.message);
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert("Password reset successfully!");
        navigate("/login"); // Redirect to login page after successful reset
      } else {
        throw new Error(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.message);
    }
  };

  const handleVerify = () => {
    verifyOTP();
  };

  return (
    <div className="otp-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &#8592;
      </button>
      <h2>Enter OTP</h2>
      <p>Please enter the 6-digit code sent to your email</p>
      {error && <p className="error-message">{error}</p>}
      {!isOtpVerified ? (
        <>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>
          <p className="resend-text">
            Didn’t receive the code?{" "}
            <span className="resend" onClick={sendOTP}>
              Resend
            </span>
          </p>
          <button className="verify-button" onClick={handleVerify}>
            Verify
          </button>
        </>
      ) : (
        <>
          <h3>Reset Your Password</h3>
          <div className="password-reset-form">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
            <button className="reset-button" onClick={resetPassword}>
              Reset Password
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OtpWidget;