import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTracking.css';

const OrderTracking = () => {
  const navigate = useNavigate();
  
  const [deliveryStatus, setDeliveryStatus] = useState({
    status: 'Processing',
    progress: 20,
    estimatedDelivery: '',
    deliveryDate: '',
    currentStep: 1,
    steps: [
      { id: 1, name: 'Order Placed', description: 'We have received your order', icon: '📦' },
      { id: 2, name: 'Processing', description: 'Your order is being prepared', icon: '🛒' },
      { id: 3, name: 'Shipped', description: 'Your order is on the way', icon: '🚚' },
      { id: 4, name: 'Out for Delivery', description: 'Your order is nearby', icon: '🏍️' },
      { id: 5, name: 'Delivered', description: 'Your order has arrived', icon: '🏠' }
    ],
    carrier: 'FedEx',
    trackingNumber: `FX${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const timerRef = useRef(null);

  // Generate random delivery date and setup progress simulation
  useEffect(() => {
    const daysToAdd = Math.floor(Math.random() * 5) + 2; // Random between 2-7 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    
    const formattedDate = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    setDeliveryStatus(prev => ({
      ...prev,
      estimatedDelivery: `Estimated delivery: ${formattedDate}`,
      deliveryDate: deliveryDate
    }));

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Simulate delivery progress
    timerRef.current = setInterval(() => {
      setDeliveryStatus(prev => {
        if (prev.progress >= 100) {
          clearInterval(timerRef.current);
          return {
            ...prev,
            status: 'Delivered',
            currentStep: 5
          };
        }

        const newProgress = Math.min(prev.progress + Math.random() * 10, 100);
        const newCurrentStep = Math.floor(newProgress / 20) + 1;
        
        let newStatus = prev.status;
        if (newCurrentStep >= 4) newStatus = 'Out for Delivery';
        else if (newCurrentStep >= 3) newStatus = 'Shipped';
        else if (newCurrentStep >= 2) newStatus = 'Processing';
        
        return {
          ...prev,
          progress: newProgress,
          currentStep: newCurrentStep > 5 ? 5 : newCurrentStep,
          status: newStatus
        };
      });
    }, 3000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-tracking-container">
      <h1>Order Tracking</h1>
      <div className="order-summary">
        <h2>Order #{deliveryStatus.orderNumber}</h2>
        <p>Status: <span className="status-badge">{deliveryStatus.status}</span></p>
        <p>{deliveryStatus.estimatedDelivery}</p>
        {deliveryStatus.status === 'Delivered' && deliveryStatus.deliveryDate && (
          <p>Delivered on: {formatDate(deliveryStatus.deliveryDate)}</p>
        )}
      </div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${deliveryStatus.progress}%` }}></div>
      </div>

      <div className="timeline">
        {deliveryStatus.steps.map((step) => (
          <div 
            key={step.id} 
            className={`timeline-step ${deliveryStatus.currentStep >= step.id ? 'active' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-details">
              <h3>{step.name}</h3>
              <p>{step.description}</p>
              {deliveryStatus.currentStep === step.id && (
                <p className="current-status">Current status</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="shipping-info">
        <h3>Shipping Information</h3>
        <p>Carrier: {deliveryStatus.carrier}</p>
        <p>Tracking Number: {deliveryStatus.trackingNumber}</p>
      </div>

      <button 
        className="back-button" 
        onClick={() => navigate('/Customer')}
      >
        Back to Home
      </button>
    </div>
  );
};

export default OrderTracking;