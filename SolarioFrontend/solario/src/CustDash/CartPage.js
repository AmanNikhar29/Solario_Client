import React, { useState, useEffect } from 'react';
import './Cart.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get customer data from localStorage
  const customerData = JSON.parse(localStorage.getItem('customer'));
  const customerId = customerData?.id;
  
  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        
        if (!customerId) {
          throw new Error('Customer ID not found. Please login again.');
        }
        
        const response = await fetch(`http://localhost:5001/api/cart/count/${customerId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load cart: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCartItems(data.items || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Failed to fetch cart items:", err);
      }
    };

    fetchCartItems();
  }, [customerId]);

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Optimistic UI update - update local state first
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // Update quantity on server
      const response = await fetch(`http://localhost:5001/api/cart/${customerId}/{id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // If server update fails, revert the local state
      const updatedData = await response.json();
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity: updatedData.quantity } : item
        )
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      // Revert to previous state if error occurs
      setCartItems(prevItems => [...prevItems]);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (id) => {
    try {
      // Store the item to remove in case we need to revert
      const itemToRemove = cartItems.find(item => item.id === id);
      
      // Optimistic UI update
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Remove item from server
      const response = await fetch(`http://localhost:5001/api/cart/${customerId}/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      // Revert to previous state if error occurs
      setCartItems(prevItems => [...prevItems]);
      alert('Failed to remove item. Please try again.');
    }
  };

  const toggleSaveForLater = async (id) => {
    try {
      // Find the item to update
      const itemToUpdate = cartItems.find(item => item.id === id);
      const newStatus = !itemToUpdate.isSavedForLater;
      
      // Optimistic UI update
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, isSavedForLater: newStatus } : item
        )
      );
      
      // Update save status on server
      const response = await fetch(`http://localhost:5001/api/cart/${customerId}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isSavedForLater: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update save status');
      }
    } catch (err) {
      console.error("Failed to update save status:", err);
      // Revert to previous state if error occurs
      setCartItems(prevItems => [...prevItems]);
      alert('Failed to update item status. Please try again.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter(item => !item.isSavedForLater)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const activeItems = cartItems.filter(item => !item.isSavedForLater);
  const savedItems = cartItems.filter(item => item.isSavedForLater);

  const proceedToCheckout = () => {
    if (activeItems.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-container">
          <h2>Error loading cart</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p className="item-count">{activeItems.length} items</p>
      </div>

      <div className="cart-container">
        <div className="cart-items-section">
          {activeItems.length > 0 ? (
            <div className="cart-items">
              {activeItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image || '/default-product.png'} alt={item.title} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-product.png';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-title">{item.title || 'Untitled Product'}</h3>
                    <p className="item-seller">Sold by: {item.seller || 'Unknown Seller'}</p>
                    {item.inStock ? (
                      <p className="item-delivery">Delivery by {item.deliveryDate || 'Within 3-5 days'}</p>
                    ) : (
                      <p className="item-delivery out-of-stock">Currently out of stock</p>
                    )}
                    
                    <div className="item-price">
                      <span className="current-price">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      {item.originalPrice > item.price && (
                        <span className="original-price">₹{(item.originalPrice || 0).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-selector">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="save-for-later"
                          onClick={() => toggleSaveForLater(item.id)}
                        >
                          Save for later
                        </button>
                        <button 
                          className="remove-item"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Your shopping cart is waiting. Give it purpose!</p>
              <button 
                className="continue-shopping" 
                onClick={() => window.location.href = '/'}
              >
                Continue Shopping
              </button>
            </div>
          )}

          {savedItems.length > 0 && (
            <div className="saved-items-section">
              <h3>Saved for later ({savedItems.length})</h3>
              {savedItems.map(item => (
                <div key={item.id} className="cart-item saved-item">
                  <div className="item-image">
                    <img src={item.image || '/default-product.png'} alt={item.title} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-product.png';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3 className="item-title">{item.title || 'Untitled Product'}</h3>
                    <p className="item-seller">Sold by: {item.seller || 'Unknown Seller'}</p>
                    {item.inStock ? (
                      <p className="item-delivery">Delivery by {item.deliveryDate || 'Within 3-5 days'}</p>
                    ) : (
                      <p className="item-delivery out-of-stock">Currently out of stock</p>
                    )}
                    
                    <div className="item-price">
                      <span className="current-price">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      {item.originalPrice > item.price && (
                        <span className="original-price">₹{(item.originalPrice || 0).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="move-to-cart"
                        onClick={() => toggleSaveForLater(item.id)}
                      >
                        Move to cart
                      </button>
                      <button 
                        className="remove-item"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeItems.length > 0 && (
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="price-details">
                <div className="price-row">
                  <span>Subtotal ({activeItems.length} items)</span>
                  <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                
                <div className="price-row">
                  <span>Delivery Charges</span>
                  <span className="free-delivery">FREE</span>
                </div>
                
                <div className="total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                className="checkout-button"
                onClick={proceedToCheckout}
              >
                Proceed to Checkout
              </button>
              
              <div className="secure-payment">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
                </svg>
                <span>Safe and Secure Payments. Easy returns.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;