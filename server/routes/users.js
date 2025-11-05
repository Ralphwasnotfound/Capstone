import express from 'express'
import {
    registerUser,
    loginUser,
    getUsers,
    deleteUser,
    createTeacherByAdmin
} from '../controllers/userController.js'

const router = express.Router()

router.get('/', getUsers)
router.post('/register', registerUser)
router.post('/create', createTeacherByAdmin)
router.post('/login', loginUser)
router.delete('/:id', deleteUser)

export default router