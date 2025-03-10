import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Password_styles/resPass.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // Get email from location state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
  if (newPassword !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  console.log("Request Payload:", { email, newPassword }); // Log the payload

  try {
    const response = await fetch("http://localhost:5000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    console.log("Response:", data); // Log the response

    if (response.ok) {
      alert("Password reset successfully!");
      navigate("/login");
    } else {
      throw new Error(data.message || "Failed to reset password.");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    setError(error.message);
  }finally{
    setLoading(false);
  }
};

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <h1>Reset Password</h1>
        <p>Enter your new password.</p>
        {error && <p className="error-message">{error}</p>}
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
          className="form-inputFor"
        />
        <button onClick={handleResetPassword} disabled={loading} className="submit-button">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;