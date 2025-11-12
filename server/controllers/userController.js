import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userDB } from '../db.js' 
import { studentDB } from '../db.js';

export const getStudents = async (req, res) => {
    try {
        const { user_id } = req.query

        let query = "SELECT * FROM students"
        const params = []

        if (user_id) {
            query += " WHERE user_id = ?"
            params.push(user_id)
        }

        const [students] = await studentDB.query(query, params)

        res.json({
            success: true,
            data: students
        })
    } catch (error) {
        console.error("Error fetching students:", error)
        res.status(500).json({ success:false, error: error })
    }
}

export const registerUser = async (req, res) => {
    const { full_name, email, password, role = 'student', contact } = req.body

    // VALID INPUT
    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' })
    }

    //  Prevent self-registration as teacher
    if (role === 'teacher') {
        return res.status(403).json({ error: 'Teacher registration is restricted to admin only.' })
    }

    try {
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        //  Students can register directly
        await userDB.query(
            'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, role, contact]
        )

        res.status(201).json({ message: 'Registration Successful' })
    } catch (err) {
        console.error('Registration Error:', err)
        res.status(500).json({ error: 'Server Error' })
    }
}

export const createTeacherByAdmin = async (req, res) => {
  const { email, full_name = "Pending Name", specialization = "Not Set", contact = null } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // 1️⃣ Check if email exists
    const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already exists' });

    // 2️⃣ Hash default password
    const defaultPassword = 'Changeme123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 3️⃣ Insert into users table
    const [userResult] = await userDB.query(
      `INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'teacher')`,
      [full_name, email, hashedPassword]
    );
    const userId = userResult.insertId;

    // 4️⃣ Insert into registrations.teachers table
    await userDB.query(
      `INSERT INTO teachers (user_id, full_name, email, specialization, contact, status)
       VALUES (?, ?, ?, ?, ?, 'approved')`,
      [userId, full_name, email, specialization, contact]
    );

    // 5️⃣ Insert into enrollment_system.teachers table
    await studentDB.query(
      `INSERT INTO teachers (user_id, full_name, email, specialization, contact, status, credential_url, id_url)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)`,
      [userId, full_name, email, specialization, contact, null, null]
    );

    res.json({
      success: true,
      message: 'Teacher created and synced!',
      defaultPassword,
      userId
    });

  } catch (err) {
    console.error('Admin create teacher error:', err);
    res.status(500).json({ error: err.message || 'Server error creating teacher' });
  }
};



export const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE id = ?', [userId])
        if (!rows.length) return res.status(404).json({ error:'User not found'})

        const user = rows[0]
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) 
            return res.status(400).json({ error:'Current password is incorrect'})

        const hashedNew = await bcrypt.hash(newPassword, 10)
        await userDB.query('UPDATE users SET PASSWORD = ? WHERE id = ?', [hashedNew, userId])

        res.json({ success: true, message: 'Password changed successfully'})
    } catch (err) {
        console.error('Changed password error:', err)
        res.status(500).json({ error: 'Server error changing password' })
    }
}

// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required'})
    }

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        const user = rows[0]

        if (!user) {
            return res.status(401).json({error: 'Invalid Email or Password'})
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ error: 'Invalid Email or Password'})
        }

        if (user.role === 'teacher') {
            const [teacherRows] = await userDB.query('SELECT id, status FROM teachers WHERE user_id = ?', [user.id])
            const teacher = teacherRows[0]
            if (!teacher || teacher.status !== 'approved') {
                return res.status(403).json({ error: 'Your account is not yet Approved.'})
            }
            user.teacher_id = teacher.id
        }

        if (user.role === 'student') {
            const [studentRows] = await userDB.query(
                'SELECT id, status FROM students WHERE user_id = ?',
                [user.id]
            )
            const student = studentRows[0]
            if (!student || !['approved', 'registration_approved'].includes(student.status)) {
                return res.status(403).json({ error: 'Your Account is not approved yet' })
            }
            user.student_id = student.id
        }

        const token = jwt.sign(
            { id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '30d'}
        )

        delete user.password
        res.json({ message: 'Login Successful',token, user})
    } catch (err) {
        console.error('Login Error:', err)
        res.status(500).json({ error: 'Server error'})
    }
}

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

                -- Teacher Details
                t.specialization,
                t.credential_url,
                t.status AS teacher_status,

                -- Student details
                s.status AS student_status

            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.email != 'admin@default.com'

                AND (u.role != 'teacher' OR t.status = 'approved')
            `)

            res.json({ users})
    } catch (err) {
        console.error('Fetch users error:', err)
        res.status(500).json({err:'Server error while fetching users'})
    }
}

// Default ADMIN
export const createDefaultAdmin = async () => {
    const defaultEmail = 'admin@default.com'
    const defaultPassword = 'admin123' // or use environment variable
    const defaultName = 'Default Admin'
    const role = 'admin'
    const contact = '0000-000-0000'

    const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [defaultEmail])
    if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)
        await userDB.query(
            'INSERT INTO users (id, full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [1 ,defaultName, defaultEmail, hashedPassword, role, contact]
        )
        console.log('Default admin created')
    } else {
        console.log('Default admin already exists')
    }
}

// DELETE USERS
export const deleteUser = async ( req , res ) => {
    const { id } = req.params
    try {
        const [result] = await userDB.query('DELETE FROM users WHERE id = ?', [id])
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not Found'})
        }
        res.json({ message: 'User deleted successfully'})
    } catch (err) {
        console.error('Delete user error:', err)
        res.status(500).json({ error: 'Server error during Deletion'})
    }
}



