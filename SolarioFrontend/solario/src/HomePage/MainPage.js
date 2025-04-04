import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./main.css";

const Opening = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  
  const handleStart = () => {
    navigate('/login');
  };

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    });
  }, [controls]);

  return (
    <div className="Home-background">
    <div className="opening-container">
      {/* Main content */}
      <div className="opening-container">
         <motion.img
         onClick={handleStart}
         src="4.png"
          initial={{ opacity: 0, y: 300 }}
          animate={controls}
          transition={{ delay: 0.3 }}
        >
        </motion.img>

       
        
      </div>
    </div>
    </div>
  );
};

export default Opening;