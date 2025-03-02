const db = require('../../config/db');

const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [seller] = await db.execute(
            'SELECT id, email, password FROM Seller WHERE email = ?',
            [email]
        );

        if (seller.length === 0) {
            return res.status(404).json({ error: "Seller not found" });
        }

        const user = seller[0];

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

module.exports = { loginSeller };
