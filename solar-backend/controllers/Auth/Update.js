const db = require('../../config/db2');

const updateInventory = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    await db.beginTransaction();

    for (const item of items) {
      // Validate required fields
      if (!item.product_id || !item.quantity) {
        await db.rollback();
        return res.status(400).json({ error: 'Each item must have product_id and quantity' });
      }

      // Check current inventory
      const [product] = await db.query(
        'SELECT quantity FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (product.length === 0) {
        await db.rollback();
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }

      const currentQuantity = product[0].quantity;
      if (currentQuantity < item.quantity) {
        await db.rollback();
        return res.status(400).json({ 
          error: `Insufficient inventory for product ${item.product_id}`,
          available: currentQuantity,
          requested: item.quantity
        });
      }

      // Update inventory
      await db.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await db.commit();
    res.status(200).json({ 
      message: 'Inventory updated successfully',
      updatedItems: items.length
    });

  } catch (err) {
    await db.rollback();
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
};

module.exports = { updateInventory };