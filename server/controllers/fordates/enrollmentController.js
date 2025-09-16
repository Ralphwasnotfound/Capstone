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

// GET semesters
export const getSemesters = async (req, res) => {
  try {
    const [rows] = await studentDB.query(
      `SELECT s.*, ay.year AS academic_year
       FROM semesters s
       JOIN academic_years ay ON s.academic_year_id = ay.id
       ORDER BY ay.year DESC, s.start_date ASC`
    );
    console.log("fetch semesters:", rows)
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching semesters:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// CREATE semester
export const createSemester = async (req, res) => {
  const { name, start_date, end_date, status, academic_year_id } = req.body;

  if (!name || !start_date || !end_date || !academic_year_id) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check for overlapping semester in the same academic year
    const [overlap] = await studentDB.query(
      `SELECT id FROM semesters 
       WHERE academic_year_id = ? 
       AND (start_date <= ? AND end_date >= ?)`,
      [academic_year_id, end_date, start_date]
    );

    if (overlap.length > 0) {
      return res.status(400).json({ success: false, message: "Semester overlaps with an existing one" });
    }

    const [result] = await studentDB.query(
      `INSERT INTO semesters (name, start_date, end_date, status, academic_year_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, start_date, end_date, status, academic_year_id]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Error creating semester:", err);
    res.status(500).json({ success: false, message: "Insert failed" });
  }
};



