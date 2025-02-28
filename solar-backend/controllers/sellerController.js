const db = require('../config/db');
const bcrypt = require('bcrypt');

const registerSeller = async (req, res) => {
    try {
        const { first_name, last_name, email, contact_no, password, store_name, store_address, profile_picture } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await db.execute(
            'INSERT INTO users (first_name, last_name, email, contact_no, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, contact_no, hashedPassword, "seller"]
        );

        const userId = userResult.insertId;

        await db.execute(
            'INSERT INTO sellers (user_id, store_name, store_address, profile_picture) VALUES (?, ?, ?, ?)',
            [userId, store_name, store_address, profile_picture]
        );

        res.json({ message: 'Seller registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering seller' });
    }
};

const getSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(
            'SELECT users.first_name, users.last_name, users.email, users.contact_no, sellers.store_name, sellers.store_address, sellers.profile_picture FROM users INNER JOIN sellers ON users.id = sellers.user_id WHERE sellers.id = ?',
            [id]
        );
        if (result.length === 0) return res.status(404).json({ error: 'Seller not found' });

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching seller details' });
    }
};

const updateSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const { store_name, store_address, profile_picture } = req.body;

        await db.execute(
            'UPDATE sellers SET store_name = ?, store_address = ?, profile_picture = ? WHERE id = ?',
            [store_name, store_address, profile_picture, id]
        );

        res.json({ message: 'Seller updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating seller details' });
    }
};

const deleteSeller = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM users WHERE id = (SELECT user_id FROM sellers WHERE id = ?)', [id]);

        res.json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting seller' });
    }
};

module.exports = { registerSeller, getSeller, updateSeller, deleteSeller };
