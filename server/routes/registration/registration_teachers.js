// routes/registration_teachers.js
import express from 'express'
import multer from 'multer'
import { registerTeacher} from '../../controllers/registration/teacherRegistrationController.js'

const router = express.Router()
const upload = multer({ dest: "uploads/" })

router.post('/', upload.fields([
    { name: 'credential', maxCount: 1},
    { name: 'id', maxCount: 1}
]),registerTeacher)


export default router
