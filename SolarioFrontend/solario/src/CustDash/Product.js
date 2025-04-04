import React, { useState, useEffect } from 'react';
import './Product.css';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Product = () => {
  // State for store data and products
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerId, setSellerId] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  // State for cart modals
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [apiError, setApiError] = useState('');
  
  const navigate = useNavigate();

  // Image error handler
  const handleImageError = (imageType, id) => {
    setImageLoadErrors(prev => ({ ...prev, [`${imageType}_${id}`]: true }));
  };

  // Fetch store and product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedId = localStorage.getItem('selectedSellerId');
        if (!storedId) {
          throw new Error("Seller ID is missing");
        }
        
        setSellerId(storedId);
        setLoading(true);

        // Fetch store data
        const storeResponse = await axios.get(`http://localhost:5000/api/seller/getSeller/${storedId}`);
        if (!storeResponse.data) {
          throw new Error("No store data received");
        }
        setStoreData(storeResponse.data);

        // Fetch products
        const productsResponse = await axios.get(`http://localhost:5000/api/products/ParticularProduct/${storedId}`);
        const receivedProducts = productsResponse.data;
        const productsArray = Array.isArray(receivedProducts) 
          ? receivedProducts 
          : receivedProducts?.products || [];
        
        setProducts(productsArray);
        setLoading(false);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
        
        if (err.message.includes("Seller ID is missing")) {
          navigate(-1);
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Cart functions
  const handleAddClick = (product) => {
    setCurrentProduct(product);
    setShowAddConfirm(true);
  };

  const confirmAddToCart = async () => {
    setShowAddConfirm(false);
    
    const customerId = JSON.parse(localStorage.getItem('customer'));
    if (!customerId) {
      setApiError('Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const cartData = {
        customer_id: customerId.id,
        product_id: currentProduct.id,
        quantity: 1,
        price: currentProduct.price,
        seller_id:currentProduct.seller_id,
        pr_name:currentProduct.name,
        image:currentProduct.product_image
      };
      
      console.log('Data being sent to cart API:', cartData); // Added this line to show what data is being sent

      const response = await axios.post('http://localhost:5001/api/cart/add', cartData);

      if (response.data.success) {
        setShowAddSuccess(true);
      } else {
        setApiError(response.data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setApiError('Error adding product to cart. Please try again.');
    }
  };

  const viewCart = () => {
    setShowAddSuccess(false);
    navigate('/cart');
  };

  const continueShopping = () => {
    setShowAddSuccess(false);
    setCurrentProduct(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading store details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!storeData) {
    return (
      <div className="no-data-container">
        <p>No store data found</p>
        <button onClick={() => navigate('/')} className="home-button">
          Go to Home
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="store-details-container">
      {/* Add to Cart Confirmation Modal */}
      {showAddConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Add to Cart</h3>
            <p>Add "{currentProduct?.name}" to your cart?</p>
            <div className="modal-buttons">
              <button onClick={confirmAddToCart} className="modal-confirm">Yes</button>
              <button onClick={() => setShowAddConfirm(false)} className="modal-cancel">No</button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Cart Success Modal */}
      {showAddSuccess && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Success!</h3>
            <p>Product added to cart successfully!</p>
            <div className="modal-buttons">
              <button onClick={viewCart} className="modal-view-cart">View Cart</button>
              <button onClick={continueShopping} className="modal-continue">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Error</h3>
            <p>{apiError}</p>
            <div className="modal-buttons">
              <button onClick={() => setApiError('')} className="modal-continue">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Store Header */}
      <div className="store-header">
      <div className="store-image-container">
        {imageLoadErrors[`store_${sellerId}`] ? (
          <div className="image-placeholder">
            <span>Store Image</span>
          </div>
        ) : (
          <img 
            src={
              (() => {
                if (storeData.store_photos) {
                  const photosArray = storeData.store_photos.split(',');
                  const firstPhoto = photosArray[0].trim();
                  const cleanedPath = firstPhoto.startsWith('/') 
                    ? firstPhoto.substring(1) 
                    : firstPhoto;
                  return `http://localhost:5000/${cleanedPath}`;
                }
                return '';
              })()
            }
            alt={storeData.store_name}
            className="store-image"
            onError={(e) => {
              console.error('Image load error:', {
                error: e.nativeEvent,
                attemptedUrl: e.target.src,
                storeData: storeData.store_photos
              });
              handleImageError('store', sellerId);
            }}
          />
        )}
      </div>
      
      <div className="store-info">
        <h1 className="store-name">{storeData.store_name}</h1>
        <div className="store-meta">
          <span className="store-city">{storeData.city}</span>
          {storeData.contact_number && (
            <span className="store-contact">Contact: {storeData.contact_number}</span>
          )}
        </div>
        {storeData.store_description && (
          <p className="store-description">{storeData.store_description}</p>
        )}
        <div className="store-actions">
          <button className="follow-store">Follow Store</button>
          <button className="share-store">Share</button>
        </div>
      </div>
    </div>
      {/* Products Section */}
      <div className="products-section">
        <div className="section-header">
          <h2 className="products-heading">Available Products</h2>
          <div className="sort-options">
            <select className="sort-dropdown">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="no-products-container">
            <p className="no-products-message">No products available</p>
            <button onClick={() => navigate(-1)} className="back-button">
              Back to Stores
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-badge">Popular</div>
                <div className="product-image-container">
                  {imageLoadErrors[`product_${product.id}`] ? (
                    <div className="image-placeholder">
                      <span>Product Image</span>
                    </div>
                  ) : (
                    <img 
                      src={
                        product.product_image 
                          ? `http://localhost:5000/uploads/${product.product_image}`
                          : ''
                      }
                      alt={product.name}
                      className="product-image"
                      onError={() => handleImageError('product', product.id)}
                    />
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    <span className="stars">★★★★☆</span>
                    <span className="rating-count">(42)</span>
                  </div>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">
                    ${product.price}
                  </p>
                  <p className="product-price">
                    {product.seller_id}
                  </p>
                  <div className="product-stock">
                    {product.stock_quantity > 0 ? (
                      <span className="in-stock">
                        In Stock ({product.stock_quantity})
                      </span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  <div className="product-actions">
                    <button 
                      className="add-to-cart" 
                      onClick={() => handleAddClick(product)}
                      disabled={product.stock_quantity <= 0}
                    >
                      Add to Cart
                    </button>
                    <button 
                      className="buy-now"
                      disabled={product.stock_quantity <= 0}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;