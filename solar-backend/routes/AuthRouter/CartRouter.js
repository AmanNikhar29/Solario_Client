const express = require('express');
const router = express.Router();
const {addToCart,getCartItems,updateCartItemQuantity,removeCartItem,getCartCount} = require('../../controllers/Auth/CartController');

// Add item to cart
router.post('/add', addToCart);

// Get cart items for a customer
router.get('/:customer_id', getCartItems);

// Update item quantity in cart
router.patch('/:customer_id/:id',updateCartItemQuantity);

// Remove item from cart
router.delete('/:customer_id/:id', removeCartItem);

// Get cart item count
router.get('/count/:customer_id', getCartCount);

module.exports = router;