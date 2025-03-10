// import React, { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import "./main.css";


// const ShopUI = () => {
//   const navigate = useNavigate();
//   const timerRef = useRef(null);

//   useEffect(() => {
//     timerRef.current = setTimeout(() => {
//       navigate("/login");
//     }, 50000000);

//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//     };
//   }, [navigate]);

//   const handleGetStarted = () => {
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//     }
//     navigate("/login");
//   };

//   return (
    
//     <div className="shop-contentMain animate-textMain">
//         <div className="icon-container">
          
//         </div>
//         <div className="gradient">
//         <h1 className="shop-logoMain">WELCOME TO SOLARIO!</h1>
        
//         </div>
//         <button className="shop-button1Main" onClick={handleGetStarted}>
//           Get Started
//         </button>
//         <button className="shop-button2Main" onClick={handleGetStarted}>
//           Learn More
//         </button>
//       <div className="TextMain">
//         <p>Our Smart Marketplace!</p>
//       </div>
        
//           <a href="/AboutUs" className="shop-link1Main"> About Us</a> 
//           <a href="/Contact" className="shop-link2Main"> Contact</a>
//           <a href="/" className="shop-link3Main"> Home</a>
//           <a href="/Services" className="shop-link4Main"> Services</a>
        
//         <p className="shop-termsMain">
//         We’re here to make your transition to solar energy easy and hassle-free!<br></br> With EcoSolar, you can explore a wide range of solar solutions, compare products, and send requests to multiple <br></br>trusted sellers—all in just a few taps. Track your requests, manage payments securely, and take control of your clean energy journey.

// Join us in building a greener future, one solar panel at a time! 
        
        
//         </p>
        
//       </div>
      
//   );
// };

// export default ShopUI;import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import "./main.css"; // Import the CSS file
import React, { useEffect } from "react";
import {useNavigate} from "react-router-dom";



const Opening = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const handleStart = () => {
  
    navigate('/login');
  }
  useEffect(() => {
    // Trigger animations when the component mounts
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    });
  }, [controls]);

  return (
    <div className="opening-container">
      {/* Background Image */}
      <div
        className="background-image"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/736x/be/28/b9/be28b92b5b9d4a89a277792980edd632.jpg')",
        }}
      >
        {/* Overlay */}
        <div className="overlay"></div>
      </div>

      {/* Content */}
      <div className="content">
        {/* Sun Icon Container */}
        <motion.div
          className="sun-container"
          initial={{ opacity: 0, y: 100 }}
          animate={controls}
        >
          <div className="sun-icon">
            <i className="fas fa-sun"></i>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.h1
          className="welcome-text"
          initial={{ opacity: 0, y: 100 }}
          animate={controls}
          transition={{ delay: 0.2 }}
        >
          Welcome to Solar.io
        </motion.h1>

        {/* Subtitle Text */}
        <motion.p
          className="subtitle-text"
          initial={{ opacity: 0, y: 100 }}
          animate={controls}
          transition={{ delay: 0.4 }}
        >
          Your Smart Marketplace!
        </motion.p>

        {/* Get Started Button */}
        <motion.button
          onClick={handleStart}
          className="get-started-button"
          initial={{ opacity: 0, y: 100 }}
          animate={controls}
          transition={{ delay:0 }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started 
        </motion.button>
      </div>
    </div>
  );
};

export default Opening;