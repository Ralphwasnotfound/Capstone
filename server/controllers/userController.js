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
    const { email, password, role = 'student' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and Password are required' });
    if (role === 'teacher') return res.status(403).json({ error: 'Teacher registration is restricted to admin only.' });

    try {
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await userDB.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );
        res.status(201).json({ message: 'Registration Successful' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ---------- CREATE TEACHER BY ADMIN ----------
export const createTeacherByAdmin = async (req, res) => {
    const { email, full_name = "Pending Name", specialization = "Not Set" } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already exists' });

        const defaultPassword = 'Changeme123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const [userResult] = await userDB.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, "teacher")',
            [email, hashedPassword]
        );
        const userId = userResult.insertId;

        // Insert into registration.teachers
        await studentDB.query(
            'INSERT INTO registration.teachers (user_id, full_name, email, specialization, status) VALUES (?, ?, ?, ?, "approved")',
            [userId, full_name, email, specialization]
        );

        // Insert into enrollment_system.teachers
        await studentDB.query(
            'INSERT INTO enrollment_system.teachers (user_id, full_name, email, specialization, status) VALUES (?, ?, ?, ?, "approved")',
            [userId, full_name, email, specialization]
        );

        res.json({ success: true, message: 'Teacher created and synced!', defaultPassword, userId });
    } catch (err) {
        console.error('Admin create teacher error:', err);
        res.status(500).json({ error: err.message || 'Server error creating teacher' });
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
    if(!email || !password) return res.status(400).json({ error: 'Email and Password are required' });

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid Email or Password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid Email or Password' });

        if (user.role === 'teacher') {
            const [teacherRows] = await studentDB.query(
                'SELECT id, full_name, status, contact, street, barangay, city, province, zipcode FROM teachers WHERE user_id = ?',
                [user.id]
            );
            const teacher = teacherRows[0];
            if (!teacher || teacher.status !== 'approved') return res.status(403).json({ error: 'Your account is not yet Approved.' });

            user.teacher_id = teacher.id;
            user.full_name = teacher.full_name;
            user.contact = teacher.contact;
            user.address = {
                street: teacher.street,
                barangay: teacher.barangay,
                city: teacher.city,
                province: teacher.province,
                zipcode: teacher.zipcode
            };
        }

        if (user.role === 'student') {
            const [studentRows] = await studentDB.query(
                'SELECT id, full_name, status FROM students WHERE user_id = ?',
                [user.id]
            );
            const student = studentRows[0];
            if (!student || !['approved', 'registration_approved'].includes(student.status)) {
                return res.status(403).json({ error: 'Your Account is not approved yet' });
            }
            user.student_id = student.id;
            user.full_name = student.full_name;
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        delete user.password;
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
                u.email,
                u.role,
                u.contact,
                u.created_at,
                t.full_name AS teacher_name,
                t.specialization,
                t.credential_url,
                t.status AS teacher_status,
                s.full_name AS student_name,
                s.status AS student_status
            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.email != 'admin@default.com'
              AND (u.role != 'teacher' OR t.status = 'approved')
        `);

        res.json({ users });
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ err: 'Server error while fetching users' });
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
