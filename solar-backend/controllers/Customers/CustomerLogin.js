const db = require('../../config/db');

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [customer] = await db.execute(
            'SELECT id, email, password FROM Customer WHERE email = ?',
            [email]
        );

        if (customer.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const user = customer[0];

        // 🔥 Directly compare plain text passwords (NOT SECURE)
        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        res.json({ message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error logging in" });
    }
};

module.exports = { loginCustomer };
