import React, { useState, useEffect } from 'react';
import './Product.css';
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


const Product = () => {
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerId, setSellerId] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productDetailsLoading, setProductDetailsLoading] = useState(false);
  const [productDetailsError, setProductDetailsError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const navigate = useNavigate();
  const { productId } = useParams();

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
        const [storeResponse, productsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/seller/getSeller/${storedId}`),
          axios.get(`http://localhost:5000/api/products/ParticularProduct/${storedId}`)
        ]);

        if (!storeResponse.data) {
          throw new Error("No store data received");
        }
        setStoreData(storeResponse.data);

        const receivedProducts = productsResponse.data;
        const productsArray = Array.isArray(receivedProducts) 
          ? receivedProducts 
          : receivedProducts?.products || [];
        
        setProducts(productsArray);
        setLoading(false);
        
        // If there's a productId in URL params, fetch that product's details
        if (productId) {
          fetchProductDetails(productId);
          setShowProductModal(true);
        }
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
  }, [navigate, productId]);

  // Check if product is favorite
  const checkIfFavorite = async (productId) => {
    const customer = JSON.parse(localStorage.getItem('customer'));
    if (!customer?.id) return false;
    
    try {
      const response = await axios.get(`http://localhost:5001/api/favorites/check`, {
        params: {
          customer_id: customer.id,
          product_id: productId
        }
      });
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  };

  // Fetch product details - UPDATED TO HANDLE NESTED PRODUCTS ARRAY
  const fetchProductDetails = async (id) => {
    try {
      setProductDetailsLoading(true);
      setProductDetailsError(null);
      const response = await axios.get(`http://localhost:5000/api/products/Prod/${id}`);
      
      // Handle the nested products array in response
      let productData;
      if (Array.isArray(response.data.products)) {
        productData = response.data.products[0]; // Get first product from array
      } else {
        productData = response.data.product || response.data;
      }

      if (!productData) {
        throw new Error("Product data not found in response");
      }
      
      const product = {
        id: productData.id || productData._id,
        name: productData.name || 'Unknown Product',
        price: parseFloat(productData.price) || 0,
        description: productData.description || 'No description available',
        category: productData.category || 'N/A',
        brand: productData.type || productData.brand || 'N/A',
        stock_quantity: parseInt(productData.stock_quantity) || 0,
        product_image: productData.product_image || productData.image || '',
        seller_id: productData.seller_id || sellerId
      };
      
      setSelectedProduct(product);
      setProductDetails(response.data);
      
      // Check if this product is a favorite
      const favoriteStatus = await checkIfFavorite(product.id);
      setIsFavorite(favoriteStatus);
      
      setProductDetailsLoading(false);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setProductDetailsError(err.message);
      setProductDetailsLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    const customer = JSON.parse(localStorage.getItem('customer'));
    if (!customer?.id) {
      setApiError('Please login to add favorites');
      return;
    }
    
    if (!selectedProduct?.id) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete('http://localhost:5001/api/favorites/remove', {
          data: {
            customer_id: customer.id,
            product_id: selectedProduct.id
          }
        });
      } else {
        // Add to favorites
        await axios.post('http://localhost:5001/api/favorites/add', {
          customer_id: customer.id,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          product_price: selectedProduct.price,
          product_image: selectedProduct.product_image,
          seller_id: selectedProduct.seller_id
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setApiError('Error updating favorites. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // View product details
  const viewProductDetails = (product) => {
    if (!product?.id) return;
    fetchProductDetails(product.id);
    setShowProductModal(true);
  };

  // Close product details modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setProductDetails(null);
    setIsFavorite(false);
    if (productId) {
      navigate(`/store/${sellerId}`);
    }
  };

  // Directly add to cart without confirmation
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!product?.id) {
      setApiError('Invalid product');
      return;
    }

    const customer = JSON.parse(localStorage.getItem('customer'));
    if (!customer?.id) {
      setApiError('Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const cartData = {
        customer_id: customer.id,
        product_id: product.id,
        quantity: 1, // Default quantity for direct add
        price: product.price,
        seller_id: product.seller_id,
        pr_name: product.name,
        image: product.product_image,
      };
      
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

  // Handle add to cart from product details
  const handleAddToCartFromDetails = async () => {
    if (!selectedProduct?.id) return;
    
    const customer = JSON.parse(localStorage.getItem('customer'));
    if (!customer?.id) {
      setApiError('Please login to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const cartData = {
        customer_id: customer.id,
        product_id: selectedProduct.id,
        quantity: quantity,
        price: selectedProduct.price,
        seller_id: selectedProduct.seller_id,
        pr_name: selectedProduct.name,
        image: selectedProduct.product_image,
      };
      
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
  const handleCartClick = () => {
    navigate('/Cart');
  };

  return (
    <div className="store-details-container">
      {/* Add to Cart Success Modal */}
      <button  className="cart-icon-container2" onClick={handleCartClick}>
              View Cart</button>
      {showAddSuccess && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-container">
          <button className="close-modal" onClick={closeProductModal}>
              &times;
            </button>
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
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-container">
            <h3>Error</h3>
            <p>{apiError}</p>
            <div className="modal-buttons">
              <button onClick={() => setApiError('')} className="modal-continue">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && (
        <div className="product-modal-overlay" style={{ zIndex: 1000 }} onClick={closeProductModal}>
          <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProductModal}>
              &times;
            </button>
            
            {productDetailsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading product details...</p>
              </div>
            ) : productDetailsError ? (
              <div className="error-container">
                <div className="error-message">Error: {productDetailsError}</div>
                <button onClick={closeProductModal} className="retry-button">
                  Back to Products
                </button>
              </div>
            ) : selectedProduct ? (
              <div className="product-modal-content">
                <div className="product-modal-images">
                  <div className="main-product-image">
                    {imageLoadErrors[`product_${selectedProduct.id}`] ? (
                      <div className="image-placeholder large">
                        <span>Product Image</span>
                      </div>
                    ) : (
                      <img
                        src={
                          selectedProduct.product_image 
                            ? `http://localhost:5000/uploads/${selectedProduct.product_image}`
                            : ''
                        }
                        alt={selectedProduct.name}
                        className="product-detail-image"
                        onError={() => handleImageError('product', selectedProduct.id)}
                      />
                    )}
                  </div>
                </div>

                <div className="product-modal-info">
                  <div className="product-title-section">
                    <h1 className="product-modal-title">{selectedProduct.name}</h1>
                    <button 
                      className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                    >
                      {isFavorite ? '❤️' : '♡'}
                    </button>
                  </div>
                  
                  <div className="product-modal-meta">
                    <div className="product-modal-rating">
                      <span className="stars">★★★★☆</span>
                      <span className="rating-count">(42 reviews)</span>
                    </div>
                    <div className="product-modal-price">
                      ${selectedProduct.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="product-modal-description">
                    <h3>Description</h3>
                    <p>{selectedProduct.description}</p>
                  </div>

                  <div className="product-modal-specs">
                    <h3>Specifications</h3>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Category:</span>
                        <span className="spec-value">{selectedProduct.category}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Brand/Type:</span>
                        <span className="spec-value">{selectedProduct.brand}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Stock:</span>
                        <span className={`spec-value ${selectedProduct.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {selectedProduct.stock_quantity > 0 
                            ? `${selectedProduct.stock_quantity} available` 
                            : 'Out of stock'}
                        </span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Product ID:</span>
                        <span className="spec-value">{selectedProduct.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="product-modal-actions">
                    <div className="quantity-selector">
                      <button 
                        className="quantity-btn" 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-value">{quantity}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => setQuantity(prev => Math.min(selectedProduct.stock_quantity, prev + 1))}
                        disabled={quantity >= selectedProduct.stock_quantity}
                      >
                        +
                      </button>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="add-to-cart-btn"
                        onClick={handleAddToCartFromDetails}
                        disabled={selectedProduct.stock_quantity <= 0}
                      >
                        {selectedProduct.stock_quantity <= 0 
                          ? 'Out of Stock' 
                          : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="error-container">
                <div className="error-message">Product data not available</div>
                <button onClick={closeProductModal} className="retry-button">
                  Back to Products
                </button>
              </div>
            )}
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
                storeData.store_photos
                  ? `http://localhost:5000/${storeData.store_photos.split(',')[0].trim().replace(/^\//, '')}`
                  : ''
              }
              alt={storeData.store_name}
              className="store-image"
              onError={() => handleImageError('store', sellerId)}
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
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => viewProductDetails(product)}
              >
                {product.stock_quantity > 0 && (
                  <div className="product-badge">Available</div>
                )}
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
                  
                  <p className="product-price">
                    ${parseFloat(product.price).toFixed(2)}
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
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stock_quantity <= 0}
                    >
                      Add to Cart
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