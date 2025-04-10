import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/styles.css';
import { motion } from "framer-motion";
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    let isValid = true;

    if (!email && !password) {
      alert('Credentials are required');
      isValid = false;
      setEmailError('');
      setPasswordError('');
    } else if (!email) {
      alert('Email is required');
      isValid = false;
      setEmailError('');
    } else if (!password) {
      alert('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) return;

    try {
      const response = await fetch('http://localhost:5001/api/login/login-Customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful! Redirecting...', {
          autoClose: false,
          isLoading:true,
          position: 'top-center',
        });

        setTimeout(() => {
          navigate('/Customer');
        }, 2500);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      setApiError('Server error. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      const response = await fetch('http://localhost:5001/api/login/google-login-Customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, googleId: decoded.sub, image: picture }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Google login successful! Redirecting...', {
          autoClose: 2500,
          isLoading:true,
          position: 'top-center',
        });

        

        // Store customer data in localStorage
        localStorage.setItem('customer2', JSON.stringify(data.customer.id));
        console.log('Customer ID:', data.customer.id);
       
        localStorage.setItem('customer', JSON.stringify(data.customer));
        localStorage.setItem('token', data.token);
  
        console.log('Customer ID:', data.customer);

        setTimeout(() => {
          navigate('/Customer');
        }, 2500);
      } else {
        alert(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-background">
      <ToastContainer />

      <motion.div
        className="login-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div
          className="login-container2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1}}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <div className="login-header">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back, Customer!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Register with your personal details to use all of our features:
            </motion.p>
            <motion.div 
              className='Account'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span onClick={handleRegister}>Don't have an account? Sign up</span>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          className='Point'
          initial={{ opacity: 0, }}
          animate={{ opacity: 1, }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <motion.p 
            className='Header1'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Sign In
          </motion.p>
          
          <motion.div
            className="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="input-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              {emailError && <span className="error-text">{emailError}</span>}
            </motion.div>
            
            <motion.div 
              className="input-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <span
                className="password-toggle-login"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
              {passwordError && <span className="error-text">{passwordError}</span>}
            </motion.div>

            <motion.div 
              className="forgot-password-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span onClick={handleForgotPassword}>Forgot Your Password?</span>
            </motion.div>

            <motion.button 
              className="login-button" 
              onClick={handleLogin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              SIGN IN
            </motion.button>

            <motion.div
              className="google-login-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="divider">
                <span>| OR |</span>
              </div>

              <div className='Google'>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log('Google Login Failed');
                  alert('Google login failed. Please try again.');
                }}
                useOneTap
                shape="circle"
                size="large"
                width="200"
                logo_alignment="center"
                text="continue_with"
                theme="outline"
              />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;