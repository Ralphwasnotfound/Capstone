import { studentDB } from '../../db.js';

// GET all
export const getAcademicYears = async (req, res) => {
  try {
    const [rows] = await studentDB.query('SELECT * FROM academic_years ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch academic years' });
  }
};

// CREATE new
// CREATE new academic year + semester
export const createAcademicYear = async (req, res) => {
  try {
    const { year, semester, enrollment_start, enrollment_end, is_active } = req.body;

    const [result] = await studentDB.query(
      `INSERT INTO academic_years 
        (year, semester, enrollment_start, enrollment_end, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [year, semester, enrollment_start || null, enrollment_end || null, is_active]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create academic year' });
  }
};

// ACTIVATE a semester and deactivate others in same year
export const deactivateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params
        const { is_active } = req.body

        const [result] = await studentDB.query(
            'UPDATE academic_years SET is_active=? WHERE id=?',
            [is_active, id]
        )

        if (result.affectedRows == 0) {
            return res.status(404).json({ success: false, error: 'Academic year not found' })
        }

        res.json({ success: true })
    } catch (err) {
        console.error('DB update error:', err)
        res.status(500).json({ success: false, error: 'Failed to updated academic year' })
    }
}

// GET active academic year
export const getActiveAcademicYear = async (req, res) => {
  try {
    const [rows] = await studentDB.query(
      `SELECT * 
       FROM academic_years 
       WHERE is_active = 1
       ORDER BY id DESC
       LIMIT 1`
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'No active academic year found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch active academic year' });
  }
};


// DELETE
export const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    await studentDB.query('DELETE FROM academic_years WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete academic year' });
  }
};
