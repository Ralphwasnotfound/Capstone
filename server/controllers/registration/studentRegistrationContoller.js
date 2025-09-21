import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDB } from '../../db.js';

export const registerStudent = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      contact,
      street,
      barangay,
      city,
      province,
      zipcode,
      guardian_name,
      guardian_contact
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled' });
    }

    // Check if email already exists
    const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create user (role = student)
    const [userResult] = await userDB.query(
      'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, 'student', contact || null]
    );

    const userID = userResult.insertId;

    // 2. Create student profile (without student_number)
    const [studentResult] = await userDB.query(
      `INSERT INTO students
      (user_id, street, barangay, city, province, zipcode, contact, guardian_name, guardian_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userID,
        street || null,
        barangay || null,
        city || null,
        province || null,
        zipcode || null,
        contact || null,
        guardian_name || null,
        guardian_contact || null
      ]
    );

    const studentId = studentResult.insertId;

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: userID, role: 'student', studentId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Send response
    res.status(201).json({
      success: true,
      user: {
        id: userID,
        full_name,
        role: 'student',
        studentId
      },
      token
    });

  } catch (err) {
    console.error('Student Registration Error:', err);
    res.status(500).json({ success: false, error: 'Server error during student registration' });
  }
};
