import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    createTeacherByAdmin,
    getStudents,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyLoginOtp,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/', getStudents)
router.post('/register', registerUser)
router.post('/create', createTeacherByAdmin)
router.post('/login', loginUser)
router.post('/verify-login-otp', verifyLoginOtp)
router.delete('/:id', deleteUser)
router.put('/change-password',verifyToken,changePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router