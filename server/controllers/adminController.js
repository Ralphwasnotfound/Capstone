import { Student } from '../models/student.js'

const enrollStudent = async (req, res) => {
    try {
        const { id } = req.params

    // Generate unique student ID (e.g., "STD-2025-001")
    const studentId = 'STD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)

    const [rowsUpdated] = await Student.update(
        { status: 'Enrolled', student_id: studentId },
        { where: { id }}
    )

    if (rowsUpdated === 0) {
        return res.status(404).json({ success: false, message: 'Student not found'})
    }

    const updatedStudent = await Student.findByPk(id)

    res.json({ success: true, data: updatedStudent })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}