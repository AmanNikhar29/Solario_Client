const db = require('../../config/db');

const registerSeller = async (req, res) => {
    try {
        const { first_name, last_name, email, contact_no, store_name, store_address, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        await db.execute(
            'INSERT INTO Seller (first_name, last_name, email, contact_no, store_name, store_address, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, contact_no, store_name, store_address, password]
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
            'SELECT first_name, last_name, email, contact_no, store_name, store_address FROM Seller WHERE id = ?',
            [id]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching seller details' });
    }
};



const updateSeller = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, confirm_password, contact_no } = req.body;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Seller ID is required' });
        }

        if (!contact_no && !password) {
            return res.status(400).json({ error: 'At least one field (password or contact_no) is required for update' });
        }

        let query = 'UPDATE Seller SET';
        const values = [];
        
        if (contact_no) {
            query += ' contact_no = ?,';
            values.push(contact_no);
        }

        if (password) {
            if (!confirm_password || password !== confirm_password) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            
            query += ' password = ?,';
            values.push(password);
        }

        // Remove trailing comma and add WHERE condition
        query = query.replace(/,$/, ' WHERE id = ?');
        values.push(id);

        await db.execute(query, values);

        res.json({ message: 'Seller profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating seller details' });
    }
};


const deleteSeller = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM Seller WHERE id = ?', [id]);

        res.json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting seller' });
    }
};

module.exports = { registerSeller, getSeller, updateSeller, deleteSeller };
