import bcrypt from "bcrypt"
import { userDB } from "../../db.js"
import { studentDB } from "../../db.js";
import { uploadToDropBox } from "../../utils/dropbox.js";
import fs from "fs"

export const registerTeacher = async (req, res) => {
    const { full_name, email, password, contact, specialization } = req.body;
    const credentialFile = req.files?.credential?.[0] || null;
    const idFile = req.files?.id?.[0] || null;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // 1. Check email
        const [existing] = await userDB.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already in use" });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        const [userResult] = await userDB.query(
            "INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)",
            [full_name, email, hashedPassword, "teacher", contact]
        );
        const userId = userResult.insertId;

        // 4. Upload files
        let credentialUrl = null;
        let idUrl = null;

        if (credentialFile) {
            credentialUrl = await uploadToDropBox(
                credentialFile.path,
                `CapstoneFiles/credentials_${Date.now()}_${credentialFile.originalname}`
            );
            fs.unlinkSync(credentialFile.path);
        }

        if (idFile) {
            idUrl = await uploadToDropBox(
                idFile.path,
                `CapstoneFiles/id_${Date.now()}_${idFile.originalname}`
            );
            fs.unlinkSync(idFile.path);
        }

        // 5. Insert into teachers table
        await userDB.query(
            `INSERT INTO teachers 
            (user_id, full_name, email, specialization, credential_url, id_url, contact, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, full_name, email, specialization || null, credentialUrl, idUrl, contact, "pending"]
        );

        // 5. Insert into studentDB (enrollment_system) teachers table
        await studentDB.query(
            `INSERT INTO teachers
            (full_name, email, specialization, contact, credential_url, id_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, specialization || null, contact, credentialUrl, idUrl , "approved"]
        )

        res.status(201).json({ message: "Teacher registered successfully, pending approval in users DB, added to enrollment system", userId });
    } catch (err) {
        console.error("Teacher registration error:", err);

        // Clean temp files
        if (credentialFile && fs.existsSync(credentialFile.path)) fs.unlinkSync(credentialFile.path);
        if (idFile && fs.existsSync(idFile.path)) fs.unlinkSync(idFile.path);

        res.status(500).json({ error: "Server error during teacher registration" });
    }
};



