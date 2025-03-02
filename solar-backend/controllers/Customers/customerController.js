const db = require('../../config/db');

const registerCustomer = async (req, res) => {
    try {
        const { first_name, last_name, email, contact_no, password ,confirm_password } = req.body;

        // 🔍 Debugging logs
        console.log("Received Data:", req.body);

        if (!first_name || !last_name || !email || !contact_no || !password || !confirm_password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const [result] = await db.execute(
            'INSERT INTO Customer (first_name, last_name, email, contact_no, password) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, contact_no, password]
        );

        res.json({ message: "Customer registered successfully" });

    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Error registering customer" });
    }
};

const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(
            'SELECT first_name, last_name, email, contact_no, password  FROM Customer WHERE id = ?',
            [id]
        );
        if (result.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching Customer details' });
    }
};



const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, confirm_password, contact_no } = req.body;

        // Validate input
        if (!id) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        if (!contact_no && !password) {
            return res.status(400).json({ error: 'At least one field (password or contact_no) is required for update' });
        }

        let query = 'UPDATE Customer SET';
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

        res.json({ message: 'Customer profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating Customer details' });
    }
};


const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM Customer WHERE id = ?', [id]);

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting Customer' });
    }
};

module.exports = { registerCustomer, getCustomer, updateCustomer, deleteCustomer };
