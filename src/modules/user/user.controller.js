const pool = require('../../config/db');

exports.getAllUsers = async (req, res) => {
    

        try {
            const result = await pool.query('SELECT * FROM reports');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }

    //res.json({ message: 'List of all users' });
};
