import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userDB } from "../../db.js";

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

    // Required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Full name, email, and password are required",
      });
    }

    // Check for existing email
    const [existing] = await userDB.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------------------------------------
    // 1️⃣ Create USER first
    // ---------------------------------------------------------
    const [userResult] = await userDB.query(
      `INSERT INTO users (full_name, email, password, contact, role)
       VALUES (?, ?, ?, ?, 'student')`,
      [full_name, email, hashedPassword, contact || null]
    );

    const userId = userResult.insertId;

    // ---------------------------------------------------------
    // 2️⃣ Create STUDENT (minimal profile)
    // ---------------------------------------------------------
    const [studentResult] = await userDB.query(
      `INSERT INTO students 
        (user_id, full_name, email, contact, street, barangay, city, province, zipcode, guardian_name, guardian_contact, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'registration_approved')`,
      [
        userId,
        full_name,
        email,
        contact || null,
        street || null,
        barangay || null,
        city || null,
        province || null,
        zipcode || null,
        guardian_name || null,
        guardian_contact || null,
      ]
    );

    const studentId = studentResult.insertId;

    // ---------------------------------------------------------
    // 3️⃣ Generate SCHOOL ID (000001 format)
    // ---------------------------------------------------------
    const schoolId = String(studentId).padStart(6, "0");

    await userDB.query(
      "UPDATE students SET school_id = ? WHERE id = ?",
      [schoolId, studentId]
    );

    // ---------------------------------------------------------
    // 4️⃣ Generate Token
    // ---------------------------------------------------------
    const token = jwt.sign(
      { id: userId, role: "student", studentId },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // ---------------------------------------------------------
    // 5️⃣ Response
    // ---------------------------------------------------------
    res.status(201).json({
      success: true,
      user: {
        id: userId,
        full_name,
        email,
        role: "student",
        studentId,
        school_id: schoolId,
      },
      token,
    });

  } catch (err) {
    console.error("Student Registration Error:", err);
    res.status(500).json({
      success: false,
      error: "Server error during student registration",
    });
  }
};
