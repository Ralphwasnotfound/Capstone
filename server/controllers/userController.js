import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userDB, studentDB } from '../db.js';

// ---------- GET STUDENTS ----------
export const getStudents = async (req, res) => {
    try {
        const { user_id } = req.query;
        let query = "SELECT * FROM students";
        const params = [];
        if (user_id) {
            query += " WHERE user_id = ?";
            params.push(user_id);
        }
        const [students] = await studentDB.query(query, params);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success:false, error });
    }
};

// ---------- REGISTER USER ----------
export const registerUser = async (req, res) => {
    const { email, password, role = 'student', contact = null } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and Password are required' });

    if (role === 'teacher')
        return res.status(403).json({ error: 'Teacher registration is restricted to admin only.' });

    try {
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult] = await userDB.query(
            'INSERT INTO users (email, password, role, contact) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, role, contact]
        );

        const userId = userResult.insertId;

        // Optionally create student profile
        if (role === 'student') {
            await studentDB.query(
                `INSERT INTO students (user_id, contact, status) VALUES (?, ?, "registration_approved")`,
                [userId, contact]
            );
        }

        res.status(201).json({ message: 'Registration Successful', userId });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

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

  // ✅ Define defaultPassword here so it is always available
  const defaultPassword = "password123";

  try {
    // Step 1: Check if user exists
    const [existingUser] = await userDB.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already exists in users table" });
    }

    // Step 2: Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Step 3: Insert into users table
    const [result] = await userDB.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "teacher"]
    );
    const userId = result.insertId;
    console.log("✅ Created user with ID:", userId);

    // Step 4: Insert into teachers table
    await studentDB.query(
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
    console.log("✅ Teacher successfully inserted!");

    // ✅ Always return the default password
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



// ---------- CHANGE PASSWORD ----------
export const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (!rows.length) return res.status(404).json({ error:'User not found' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error:'Current password is incorrect' });

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await userDB.query('UPDATE users SET password = ? WHERE id = ?', [hashedNew, userId]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error changing password' });
    }
};

// ---------- LOGIN ----------
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required' });
    }

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid Email or Password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid Email or Password' });

        if (user.role === 'teacher') {
            const [teacherRows] = await userDB.query(
                'SELECT id, status, contact FROM teachers WHERE user_id = ?',
                [user.id]
            );
            const teacher = teacherRows[0];
            if (!teacher || teacher.status !== 'approved') {
                return res.status(403).json({ error: 'Your account is not yet Approved.' });
            }
            user.teacher_id = teacher.id;
            user.contact = teacher.contact; // ensure contact comes from teachers table
        }

        if (user.role === 'student') {
            const [studentRows] = await userDB.query(
                'SELECT id, status, contact FROM students WHERE user_id = ?',
                [user.id]
            );
            const student = studentRows[0];
            if (!student || !['approved', 'registration_approved'].includes(student.status)) {
                return res.status(403).json({ error: 'Your Account is not approved yet' });
            }
            user.student_id = student.id;
            user.contact = student.contact; // ensure contact comes from students table
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        delete user.password; // remove password from response
        res.json({ message: 'Login Successful', token, user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


// ---------- GET USERS ----------
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



// ---------- CREATE DEFAULT ADMIN ----------
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

// ---------- DELETE USER ----------
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await userDB.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not Found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error during Deletion' });
    }
};

// ---------- UPDATE TEACHER PROFILE ----------
export const updateTeacherProfile = async (req, res) => {
    const userId = req.params.id;
    const {
        full_name, profile_picture, email, contact,
        street, barangay, city, province, zipcode,
        bio, occupation, education, skills, specialization, status,
        credential_url, id_url
    } = req.body;

    try {
        await studentDB.query(
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
