import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDB, studentDB } from '../db.js';
import nodemailer from 'nodemailer';
import crypto from "crypto";


// ======================================================
// GET STUDENTS  (from userDB)
// ======================================================
export const getStudents = async (req, res) => {
    try {
        const { user_id } = req.query;
        let query = "SELECT * FROM students";
        const params = [];

        if (user_id) {
            query += " WHERE user_id = ?";
            params.push(user_id);
        }

        const [students] = await userDB.query(query, params);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success:false, error });
    }
};

// ======================================================
// REGISTER USER (student only)
// ======================================================
export const registerUser = async (req, res) => {
    const { 
        full_name, 
        email, 
        password, 
        role = 'student', 
        contact = null
    } = req.body;

    if (!email || !password || !full_name)
        return res.status(400).json({ error: 'Full name, email, and password are required' });

    try {
        // Check if email already exists
        const [existing] = await userDB.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0)
            return res.status(409).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const [userResult] = await userDB.query(
            'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, role, contact]
        );

        const userId = userResult.insertId;

        // AUTO-CREATE student profile (minimal)
        if (role === 'student') {

            const [studentInsert] = await userDB.query(
                `INSERT INTO students 
                (user_id, full_name, email, contact, status) 
                 VALUES (?, ?, ?, ?, "registration_approved")`,
                [userId, full_name, email, contact]
            );

            const studentId = studentInsert.insertId;

            // Generate school_id (000001 format)
            const schoolId = String(studentId).padStart(6, "0");

            await userDB.query(
                `UPDATE students SET school_id = ? WHERE id = ?`,
                [schoolId, studentId]
            );
        }

        return res.status(201).json({
            success: true,
            message: "Registration Successful",
            userId
        });

    } catch (err) {
        console.error("❌ Registration Error:", err);
        return res.status(500).json({ error: "Server Error" });
    }
};



// ======================================================
// CREATE TEACHER BY ADMIN
// ======================================================
export const createTeacherByAdmin = async (req, res) => {
  console.log("Incoming body:", req.body);

  const {
    email,
    full_name = "Pending Name",
    specialization = "Not Set",
    contact = null,
    address = null,
    bio = null,
    occupation = null,
    education = null,
    skills = null,
    status = "approved",
    credential_url = null,
    id_url = null,
    profile_picture = null
  } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const defaultPassword = "password123";

  try {
    // 1. check if already exists
    const [existingUser] = await userDB.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0)
      return res.status(409).json({ error: "Email already exists in users table" });

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 2. create user
    const [result] = await userDB.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "teacher"]
    );

    const userId = result.insertId;

    // 3. insert teacher profile
    await userDB.query(
      `INSERT INTO teachers 
        (user_id, full_name, profile_picture, email, contact, address, bio, occupation, education, skills, specialization, status, credential_url, id_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        full_name,
        profile_picture,
        email,
        contact,
        address,
        bio,
        occupation,
        education,
        skills,
        specialization,
        status,
        credential_url,
        id_url
      ]
    );

    return res.status(201).json({
      message: "Teacher created successfully",
      user_id: userId,
      temporary_password: defaultPassword
    });

  } catch (error) {
    console.error("❌ Error creating teacher:", error);
    return res.status(500).json({ error: "Failed to create teacher" });
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================
export const changePassword = async (req, res) => {
    try {
        // userId now comes from token
        const userId = req.user.id;  

        const { currentPassword, newPassword } = req.body;

        const [rows] = await userDB.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

        const hashedNew = await bcrypt.hash(newPassword, 10);

        await userDB.query('UPDATE users SET password = ? WHERE id = ?', [hashedNew, userId]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error changing password' });
    }
};


// ======================================================
// LOGIN USER
// ======================================================
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and Password are required' });

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid Email or Password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid Email or Password' });

        // Skip approval checks until OTP is verified
        const otp = crypto.randomInt(100000, 999999);

        await userDB.query(`
            INSERT INTO password_reset_tokens (user_id, otp, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
            ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)
        `, [user.id, otp]);

        // Simulated OTP email
        const transporter = nodemailer.createTransport({ jsonTransport: true });
        await transporter.sendMail({
            from: "System <no-reply@school.com>",
            to: user.email,
            subject: "Your Login OTP",
            text: `Your OTP code is: ${otp}. Valid for 10 minutes.`
        });

        console.log("🔐 LOGIN OTP SENT:", { email: user.email, otp });

        return res.json({
            success: true,
            requiresOTP: true,
            userId: user.id,
            message: "OTP sent. Please verify."
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const verifyLoginOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp)
        return res.status(400).json({ error: "Missing OTP or userId" });

    try {
        const [tokenRows] = await userDB.query(`
            SELECT otp, expires_at FROM password_reset_tokens WHERE user_id = ?
        `, [userId]);

        if (!tokenRows.length)
            return res.status(400).json({ error: "No OTP found. Login again." });

        const token = tokenRows[0];

        if (String(token.otp) !== String(otp))
            return res.status(400).json({ error: "Invalid OTP." });

        if (new Date(token.expires_at) < new Date())
            return res.status(400).json({ error: "OTP expired." });

        // Fetch user
        const [userRows] = await userDB.query("SELECT * FROM users WHERE id = ?", [userId]);
        const user = userRows[0];

        if (!user) return res.status(404).json({ error: "User not found" });

        // Apply the same approval checks here
        if (user.role === "student") {
            const [stu] = await userDB.query("SELECT status FROM students WHERE user_id = ?", [userId]);
            if (!["approved", "registration_approved"].includes(stu[0].status)) {
                return res.status(403).json({ error: "Your account is not approved yet." });
            }
        }

        if (user.role === "teacher") {
            const [tea] = await userDB.query("SELECT status FROM teachers WHERE user_id = ?", [userId]);
            if (tea[0].status !== "approved") {
                return res.status(403).json({ error: "Teacher account not approved." });
            }
        }

        // OTP is correct — LOG IN USER NOW
        const tokenJwt = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Cleanup
        await userDB.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [userId]);

        delete user.password;

        res.json({
            success: true,
            message: "Login successful",
            token: tokenJwt,
            user
        });

    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ error: "Server error verifying OTP." });
    }
};


// ======================================================
// GET USERS (admin)
// ======================================================
export const getUsers = async (req, res) => {
  try {
    const [users] = await userDB.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.role, 
        u.contact, 
        u.created_at,
        t.status AS teacher_status,
        s.user_id AS student_user_id
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.email != 'admin@default.com'
    `);

    const formattedUsers = users.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      contact: u.contact || '',
      created_at: u.created_at,
      status:
        u.role === 'teacher'
          ? u.teacher_status || ''
          : u.role === 'student'
          ? 'Active'
          : ''
    }));

    res.json({ users: formattedUsers });
  } catch (err) {
    console.error('❌ Fetch users error:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// ======================================================
// DELETE USER
// ======================================================
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await userDB.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'User not Found' });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error during Deletion' });
    }
};

// ======================================================
// UPDATE TEACHER PROFILE
// ======================================================
export const updateTeacherProfile = async (req, res) => {
    const userId = req.params.id;

    const {
        full_name, profile_picture, email, contact,
        street, barangay, city, province, zipcode,
        bio, occupation, education, skills, specialization, status,
        credential_url, id_url
    } = req.body;

    try {
        await userDB.query(
            `UPDATE teachers
             SET full_name=?, profile_picture=?, email=?, contact=?,
                 street=?, barangay=?, city=?, province=?, zipcode=?,
                 bio=?, occupation=?, education=?, skills=?, specialization=?,
                 status=?, credential_url=?, id_url=?
             WHERE user_id=?`,
            [full_name, profile_picture, email, contact,
             street, barangay, city, province, zipcode,
             bio, occupation, education, skills, specialization,
             status, credential_url, id_url, userId]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

// ======================================================
// CREATE DEFAULT ADMIN
// ======================================================
export const createDefaultAdmin = async () => {
    const defaultEmail = 'admin@default.com';
    const defaultPassword = 'admin123';
    const role = 'admin';
    const contact = '0000-000-0000';

    const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [defaultEmail]);
    if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await userDB.query(
            'INSERT INTO users (id, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [1, defaultEmail, hashedPassword, role, contact]
        );
        console.log('Default admin created');
    } else {
        console.log('Default admin already exists');
    }
};

// ======================================================
// FORGOT PASSWORD (SEND OTP)
// ======================================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if user exists
    const [rows] = await userDB.query(
      "SELECT id, email FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Email not found." });
    }

    const user = rows[0];

    // Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999);

    // Save OTP to DB (create a new table reset_tokens if not existing)
    await userDB.query(
      `INSERT INTO password_reset_tokens (user_id, otp, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
       ON DUPLICATE KEY UPDATE 
         otp = VALUES(otp),
         expires_at = VALUES(expires_at)`,
      [user.id, otp]
    );

    // Use simulated transporter (prints only — no email sent)
    const transporter = nodemailer.createTransport({
      jsonTransport: true,
    });

    // Send OTP (simulated)
    await transporter.sendMail({
      from: "Capstone System <no-reply@school.com>",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    });

    console.log("📩 SIMULATED EMAIL SENT:");
    console.log({
      to: email,
      otp,
    });

    res.json({ success: true, message: "OTP sent (simulated)." });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error sending OTP." });
  }
};


// ======================================================
// RESET PASSWORD (VERIFY OTP + SET NEW PASSWORD)
// ======================================================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1. Get user
    const [userRows] = await userDB.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRows[0].id;

    // 2. Verify OTP
    const [tokenRows] = await userDB.query(
      `SELECT otp, expires_at
       FROM password_reset_tokens
       WHERE user_id = ?`,
      [userId]
    );

    if (!tokenRows.length) {
      return res.status(400).json({ error: "No OTP found. Request again." });
    }

    const token = tokenRows[0];

    if (String(token.otp) !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    if (new Date(token.expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP has expired." });
    }

    // 3. Update password
    const hashed = await bcrypt.hash(newPassword, 10);

    await userDB.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, userId]
    );

    // 4. Delete token after use
    await userDB.query(
      "DELETE FROM password_reset_tokens WHERE user_id = ?",
      [userId]
    );

    res.json({ success: true, message: "Password reset successful!" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error resetting password." });
  }
};
