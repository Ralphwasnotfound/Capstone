import { userDB } from '../../db.js'

export const getPendingTeachers = async (req, res) => {
  try {
    const [teachers] = await userDB.query(`
      SELECT t.id, u.full_name, u.email, t.specialization, t.contact, t.status
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
    `)
    res.json({ success: true, data: teachers })
  } catch (err) {
    console.error("Error fetching teachers:", err.message)
    res.status(500).json({ error: "Server error fetching teachers" })
  }
}

export const approveTeacher = async (req, res) => {
  const { id } = req.params
  try {
    await userDB.query("UPDATE teachers SET status = 'approved' WHERE id = ?", [id])
    res.json({ message: "Teacher approved successfully" })
  } catch (err) {
    console.error("Error approving teacher:", err.message)
    res.status(500).json({ error: "Server error approving teacher" })
  }
}

export const rejectTeacher = async (req, res) => {
  const { id } = req.params
  try {
    await userDB.query("UPDATE teachers SET status = 'rejected' WHERE id = ?", [id])
    res.json({ message: "Teacher rejected successfully" })
  } catch (err) {
    console.error("Error rejecting teacher:", err.message)
    res.status(500).json({ error: "Server error rejecting teacher" })
  }
}

export const getApprovedTeachers = async (req, res) => {
  try {
    const [teachers] = await userDB.query(`
      SELECT t.id, u.full_name, u.email, t.specialization, t.contact
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.role = 'teacher' AND t.status = 'approved'
      `)
    res.json ({ success:true, data: teachers})
  } catch (err) {
    console.error("Error fetching approved teachers:", err.message)
    res.status(500).json({ error: 'Server error fetching approved teachers'})
  }
}
