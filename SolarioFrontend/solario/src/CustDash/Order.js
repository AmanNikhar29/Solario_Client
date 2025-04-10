import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ord.css';

const OrderSummaryPage = () => {
  const navigate = useNavigate();
  const [orderSummary, setOrderSummary] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  const customerData = JSON.parse(localStorage.getItem('customer'));
  const customerId = customerData?.id;

  // Image error handler
  const handleImageError = (imageType, id) => {
    setImageLoadErrors(prev => ({ ...prev, [`${imageType}_${id}`]: true }));
  };

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
              image: item.image ? `http://localhost:5000/uploads/${item.image}` : '/default-product.png',
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

 

 

  const proceedToPayment = () => {
    navigate('/Payment');
  };

  const backToAddress = () => {
    navigate('/AddressDetails');
  };

  return (
    <div className="order-summary-container">
      <div className="order-summary-header">
        <h1>Checkout</h1>
        <div className="progress-steps">
          <span 
            className="step completed"
            onClick={backToAddress}
          >
            Address Details
          </span>
          <span className="step active">
            Order Summary
          </span>
          <span className="step">
            Payment
          </span>
        </div>
      </div>
      
      <div className="order-summary-content">
        <div className="order-items-section">
          <h2>Your Order</h2>
          
          {loading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Loading order details...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>Error loading order details: {error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          ) : orderSummary.items.length === 0 ? (
            <div className="empty-cart-message">
              <p>Your cart is empty</p>
              <button onClick={() => navigate('/Customer')}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="order-items">
              {orderSummary.items.map((item, index) => (
                <div className="order-item" key={index}>
                  <div className="item-image">
                    {imageLoadErrors[`product_${item.id}`] ? (
                      <div className="image-placeholder">
                        <span>Product Image</span>
                      </div>
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.pr_name} 
                        onError={() => handleImageError('product', item.id)}
                      />
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.pr_name}</h4>
                    {item.variant && <p>Variant: {item.variant}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    <p>Price: ${item.price}</p>
                    
                  </div>
                  <div className="item-price">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="order-totals-section">
          <h2>Order Summary</h2>
          
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
          
          <button 
            className="proceed-to-payment"
            onClick={proceedToPayment}
            disabled={orderSummary.items.length === 0 || parseFloat(orderSummary.total) <= 0}
          >
            Proceed to Payment
          </button>
          
          <div className="customer-support">
            <h4>Need help?</h4>
            <p>
              <i className="fas fa-phone"></i> Call us at (800) 123-4567
            </p>
            <p>
              <i className="fas fa-envelope"></i> Email us at support@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;