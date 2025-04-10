import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    saveCard: false,
    paymentMethod: 'card' // 'card' or 'upi'
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    orderTotal: 0,
    itemsCount: 0
  });
  
  const customerData = JSON.parse(localStorage.getItem('customer'));
  const customerId = customerData?.id;
  const [activeStep, setActiveStep] = useState('payment');

  // Fetch order summary from API
  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!customerId) {
          throw new Error('Customer ID not found. Please login again.');
        }
        
        const response = await fetch(`http://localhost:5001/api/cart/${customerId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from the server');
        }
        
        const processedItems = Array.isArray(data.items) 
          ? data.items.map(item => ({
              ...item,
              product_id: item.id,
              price: parseFloat(item.price || 0).toFixed(2),
              quantity: parseInt(item.quantity || 1)
            }))
          : [];
        
        const subtotal = parseFloat(data.subtotal || processedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)).toFixed(2);
        const shipping = parseFloat(data.shipping || 0).toFixed(2);
        const discount = parseFloat(data.discount || 0).toFixed(2);
        const total = (parseFloat(subtotal) + parseFloat(shipping) - parseFloat(discount)).toFixed(2);
        
        setOrderSummary({
          items: processedItems,
          subtotal,
          shipping,
          discount,
          total
        });
      } catch (err) {
        console.error('Error fetching order summary:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, [customerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.match(/^\d{16}$/)) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      
      if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!formData.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
    } else if (formData.paymentMethod === 'upi') {
      if (!formData.upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/)) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g. name@upi)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsProcessing(true);
      
      try {
        // Create the order
        const orderResponse = await fetch('http://localhost:5001/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            items: orderSummary.items,
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            discount: orderSummary.discount,
            total: orderSummary.total,
            paymentMethod: formData.paymentMethod
          })
        });

        if (!orderResponse.ok) {
          throw new Error('Failed to process payment and create order');
        }

        const orderData = await orderResponse.json();
        
        // Clear the cart after successful order placement
        await fetch(`http://localhost:5001/api/cart/${customerId}`, {
          method: 'DELETE'
        });
        
        setOrderDetails({
          orderId: orderData.orderId,
          orderTotal: orderSummary.total,
          itemsCount: orderSummary.items.length
        });
        
        setPaymentSuccess(true);
        setShowSuccessModal(true);
        
      } catch (err) {
        console.error('Payment processing error:', err);
        setError(err.message || 'Payment processing failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });
  };

  const selectPaymentMethod = (method) => {
    setFormData({
      ...formData,
      paymentMethod: method
    });
    setErrors({});
  };

  const navigateToStep = (step) => {
    if (step === 'address') {
      navigate('/address');
    } else if (step === 'summary') {
      navigate('/order');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/Delivery'); // Make sure this matches your route exactly
  };

  return (
    <div className="payment-container">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-content">
              <div className="success-icon">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M10,17l-5-5l1.41-1.41L10,14.17l7.59-7.59L19,8L10,17z" />
                </svg>
              </div>
              <h2>Payment Successful!</h2>
              <p>Your order #{orderDetails.orderId} has been placed successfully.</p>
              <div className="order-details">
                <p><strong>Total Paid:</strong> ${orderDetails.orderTotal}</p>
                <p><strong>Items:</strong> {orderDetails.itemsCount}</p>
              </div>
              <div className="success-actions">
                <button 
                  className="view-order-btn" 
                  onClick={handleSuccessModalClose}
                >
                  View Order Details
                </button>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="payment-header">
        <h1>Checkout</h1>
        <div className="progress-steps">
          <span 
            className={`step ${activeStep === 'address' ? 'active' : 'completed'}`}
            onClick={() => navigateToStep('address')}
          >
            Address Details
          </span>
          <span 
            className={`step ${activeStep === 'summary' ? 'active' : 'completed'}`}
            onClick={() => navigateToStep('summary')}
          >
            Order Summary
          </span>
          <span 
            className={`step ${activeStep === 'payment' ? 'active' : ''}`}
          >
            Payment
          </span>
        </div>
      </div>
      
      <div className="payment-content">
        <div className="order-summary-preview">
          <h3>Order Total</h3>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${orderSummary.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {orderSummary.shipping === '0.00' ? 'Free' : `$${orderSummary.shipping}`}
              </span>
            </div>
            {parseFloat(orderSummary.discount) > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${orderSummary.discount}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>${orderSummary.total}</span>
            </div>
          </div>
        </div>
        <div className="payment-form-container">
          <h2>Payment Method</h2>
          
          <div className="payment-methods">
            <button 
              type="button"
              className={`payment-method ${formData.paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => selectPaymentMethod('card')}
            >
              <div className="card-logos">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-amex"></i>
                <i className="fab fa-cc-discover"></i>
                <i className="fab fa-cc-rupay"></i>
              </div>
              Credit/Debit Card
            </button>
            <button 
              type="button"
              className={`payment-method ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => selectPaymentMethod('upi')}
            >
              <div className="upi-logos">
                <img src="https://as1.ftcdn.net/v2/jpg/05/60/50/16/1000_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.jpg" alt="UPI" />
              </div>
              UPI Payment
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="payment-form">
            {formData.paymentMethod === 'card' ? (
              <>
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.cardName ? 'error' : ''}
                  />
                  {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={errors.expiryDate ? 'error' : ''}
                    />
                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                      className={errors.cvv ? 'error' : ''}
                    />
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="saveCard"
                    name="saveCard"
                    checked={formData.saveCard}
                    onChange={handleChange}
                  />
                  <label htmlFor="saveCard">Save card for future payments</label>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="name@upi"
                  className={errors.upiId ? 'error' : ''}
                />
                {errors.upiId && <span className="error-message">{errors.upiId}</span>}
                <div className="upi-note">
                  <p>Enter your UPI ID (e.g. mobilenumber@upi, name@bankname) or scan QR code</p>
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="pay-button" 
              disabled={isProcessing || loading || error || parseFloat(orderSummary.total) <= 0}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                `Pay $${orderSummary.total || '0.00'}`
              )}
            </button>
            
            {parseFloat(orderSummary.total) <= 0 && (
              <div className="error-message" style={{ marginTop: '10px' }}>
                Cannot proceed with payment: Order total must be greater than $0.00
              </div>
            )}
            
            <div className="secure-payment">
              <i className="fas fa-lock"></i> Your payment is secure and encrypted
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;