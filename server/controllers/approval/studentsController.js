import { userDB } from '../../db.js'

export const getPendingStudentsRegistration = async (req, res) => {
    try {
        const [students] = await userDB.query(`
            SELECT s.id, u.full_name, u.email, s.contact, s.status
                FROM students s
                JOIN users u ON s.user_id = u.id
                WHERE s.status = 'registration_pending'
            `)
        res.json({ success: true, data: students})
    } catch (err) {
        console.error("Error fetching students:", err.message)
        res.status(500).json({ error: "Server error fetching students" })
    }
}

export const approveStudent = async (req, res) => {
    const { id } = req.params
        try {
            await userDB.query("UPDATE students SET status = 'registration_approved' WHERE id = ?", [id])
            res.json({ message: "Student approved successfully" })
    } catch (err) {
        console.error("Error approving student:", err.message)
        res.status(500).json({ error: "Server error approving student" })
    }
}

export const rejectStudent = async (req, res) => {
    const { id } = req.params
        try {
            await userDB.query("UPDATE students SET status = 'registration_rejected' WHERE id = ?", [id])
            res.json({ message: "Student rejected successfully" })
        } catch (err) {
        console.error("Error rejecting student:", err.message)
        res.status(500).json({ error: "Server error rejecting student" })
    }
}