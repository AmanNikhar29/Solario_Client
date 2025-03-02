const db = require("../../config/db");

const addProduct = async (req,res) => {

    try {
        const { product_id , seller_id , product_name, description, price ,stock_quantity ,category ,status ,rating } = req.body;

        console.log("Received Data:", req.body);

        if (!product_id || !seller_id || !product_name || !description || !price || !stock_quantity|| !category || !status || !rating) {
            return res.status(400).json({ error: "All fields are required" });
        }

        await db.execute(
            'INSERT INTO products (product_id, seller_id, product_name, description, price, stock_quantity, category, status ,rating) VALUES (?, ?, ?, ?, ?)',
            [product_id, seller_id, product_name, description, price, stock_quantity, category, status, rating]
        );

        res.json({ message: "Product added successfully" });

    } 
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Error adding product" });
    }
}

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(
            'SELECT seller_id, product_name, description, price, stock_quantity, category, status, rating  FROM products WHERE id = ?',
            [id]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching product details' });
    }
};



const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, price, stock_quantity ,status } = req.body;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        if (!description && !price && !stock_quantity && !status) {
            return res.status(400).json({ error: 'At least one field (description or price or stock_quantity or status) is required for update' });
        }

        let query = 'UPDATE products SET';
        const values = [];
        
        if (description) {
            query += ' contact_no = ?,';
            values.push(description);
        }
        if (price) {
            query += ' price = ?,';
            values.push(price);
        }
        if (stock_quantity) {
            query += ' stock_quantity = ?,';
            values.push(stock_quantity);
        }
        if (status) {
            query += ' status = ?,';
            values.push(status);
        }

        
        query = query.replace(/,$/, ' WHERE id = ?');
        values.push(id);

        await db.execute(query, values);

        res.json({ message: 'Product details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating product details' });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM products WHERE id = ?', [id]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting Product' });
    }
};

module.exports = { addProduct, getProduct, updateProduct, deleteProduct };