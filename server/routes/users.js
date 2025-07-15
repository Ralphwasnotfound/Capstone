import express from 'express'
import {
    registerUser,
    loginUser,
    getUsers,
    deleteUser
} from '../controllers/userController.js'

const router = express.Router()

router.get('/', getUsers)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.delete('/:id', deleteUser)

export default router