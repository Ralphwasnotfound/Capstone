import { studentDB } from '../db.js';

// Get all subjects
export const getSubjects = async (req, res) => {
    try {
        const [results] = await studentDB.query('SELECT * FROM subjects');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
};

// Add a subject
export const createSubject = async (req, res) => {
    const { name, code, units } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'Name and code required' });

    try {
        const [result] = await studentDB.query('INSERT INTO subjects (name, code, units) VALUES (?, ?, ?)', [name, code, units || 3]);
        res.json({ id: result.insertId, name, code, units });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
};
