import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Password_styles/forPass.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent successfully!");
        navigate("/verify-otp", { state: { email } }); // Navigate to OTP verification page
      } else {
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h1>Forgot Password</h1>
        <p>Enter your email to receive an OTP.</p>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />
        <button onClick={handleSendOTP} disabled={loading} className="submit-button1">
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;