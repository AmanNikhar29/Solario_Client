const db = require('../../config/db');

const addToCart = async (req, res) => {
  try {
    const { 
      customer_id, 
      image,
      pr_name,
      price,
      product_id, 
      quantity,
      seller_id
    } = req.body;

    // Input validation
    if (!customer_id || !image || !pr_name || !price || !product_id || !quantity || !seller_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      `SELECT id, customer_id, pr_name, quantity FROM cart_items 
       WHERE customer_id = ? AND product_id = ? AND seller_id = ?`,
      [customer_id, product_id, seller_id]
    );

    if (existingItem && existingItem.length > 0) {
      // Update quantity if item exists
      const newQuantity = existingItem[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem[0].id]
      );
    } else {
      // Add new item to cart
      await db.query(
        `INSERT INTO cart_items 
        (customer_id, image, pr_name, price, product_id, quantity, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customer_id, image, pr_name, price, product_id, quantity, seller_id]
      );
    }

    // Get updated cart count
    const [cartCount] = await db.query(
      'SELECT COUNT(*) AS count FROM cart_items WHERE customer_id = ?',
      [customer_id]
    );

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      count: cartCount[0].count
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getCartItems = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const [items] = await db.query(
      'SELECT * FROM cart_items WHERE customer_id = ?',
      [customer_id]
    );

    res.status(200).json({
      success: true,
      items: items
    });

  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { customer_id, id } = req.params;
    const { quantity } = req.body;

    // Input validation
    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity value'
      });
    }

    // Check if item exists and belongs to customer
    const [item] = await db.query(
      'SELECT id FROM cart_items WHERE id = ? AND customer_id = ?',
      [id, customer_id]
    );

    if (!item || item.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart'
      });
    }

    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, id]
    );

    // Get updated cart
    const [updatedItem] = await db.query(
      'SELECT * FROM cart_items WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Quantity updated successfully',
      item: updatedItem[0]
    });

  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { customer_id, id } = req.params;

    // Check if item exists and belongs to customer
    const [item] = await db.query(
      'SELECT id FROM cart_items WHERE id = ? AND customer_id = ?',
      [id, customer_id]
    );

    if (!item || item.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart'
      });
    }

    // Remove item
    await db.query(
      'DELETE FROM cart_items WHERE id = ?',
      [id]
    );

    // Get updated cart count
    const [cartCount] = await db.query(
      'SELECT COUNT(*) AS count FROM cart_items WHERE customer_id = ?',
      [customer_id]
    );

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      count: cartCount[0].count
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getCartCount = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const [count] = await db.query(
      'SELECT COUNT(*) AS count FROM cart_items WHERE customer_id = ?',
      [customer_id]
    );

    res.status(200).json({
      success: true,
      count: count[0].count
    });

  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  getCartCount
};