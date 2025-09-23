import { studentDB } from "../../db.js";

// GET all academic years
export const getAcademicYears = async (req, res) => {
  try {
    const [rows] = await studentDB.query("SELECT * FROM academic_years");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// GET active academic year
// Get the currently active academic year
export const getActiveAcademicYear = async (req, res) => {
    try {
        const [rows] = await studentDB.query(
            `SELECT id, year, status 
             FROM academic_years 
             WHERE status = 'open'
             ORDER BY created_at DESC
             LIMIT 1`
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No active academic year found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

// CREATE academic year
export const createAcademicYear = async (req, res) => {
  const { year, semester, status } = req.body;
  if (!year || !semester || !status) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const [result] = await studentDB.query(
      `INSERT INTO academic_years (year, semester, status) VALUES (?, ?, ?)`,
      [year, semester, status]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Insert Failed" });
  }
};

// GET active terms for enrollment
export const getTerms = async (req, res) => {
  try {
    const [rows] = await studentDB.query(
      `SELECT 
         id AS academic_year_id,
         CONCAT(semester, ' (', year, ')') AS name
       FROM academic_years
       WHERE status = 'open'
       ORDER BY created_at ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};



