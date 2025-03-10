import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Password_styles/otpVerif.css";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get email from location state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP verified successfully!");
        navigate("/reset-password", { state: { email } }); // Navigate to reset password page
      } else {
        throw new Error(data.message || "Invalid OTP.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-content">
        <h1>Verify OTP</h1>
        <p>Enter the 6-digit OTP sent to your email.</p>
        {error && <p className="error-message">{error}</p>}
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => {
                const newOtp = [...otp];
                newOtp[index] = e.target.value;
                setOtp(newOtp);
              }}
              className="otp-input"
            />
          ))}
        </div>
        <button onClick={handleVerifyOTP} disabled={loading} className="submit-button">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;