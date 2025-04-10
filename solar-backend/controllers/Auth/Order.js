const db = require('../../config/db');

const createOrder = async (req, res) => {
  const { customerId, items, subtotal, shipping, discount, total, paymentMethod } = req.body;

  if (!customerId || !items || !items.length || !subtotal || !total || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await db.getConnection(); // Get a connection from pool

  try {
    await connection.beginTransaction(); // Start transaction

    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
      (customer_id, subtotal, shipping, discount, total, payment_method, payment_status, status)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', 'processing')`,
      [customerId, subtotal, shipping, discount, total, paymentMethod]
    );

    const orderId = orderResult.insertId;

    const orderItemsValues = items.map(item => [
      orderId,
      item.product_id,
      item.pr_name,
      item.variant || null,
      item.color || null,
      item.price,
      item.quantity,
      item.image || null
    ]);

    await connection.query(
      `INSERT INTO order_items 
      (order_id, product_id, product_name, variant, color, price, quantity, image)
      VALUES ?`,
      [orderItemsValues]
    );

    await connection.execute(
      'DELETE FROM cart_items WHERE customer_id = ?',
      [customerId]
    );

    await connection.commit(); // Commit transaction

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      itemsCount: items.length,
      total
    });

  } catch (error) {
    await connection.rollback(); // Rollback transaction on error
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release(); // Always release the connection
  }
};

module.exports = {
  createOrder
};
