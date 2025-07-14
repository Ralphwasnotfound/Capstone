app.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required'})
    }

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
    

    const user = rows[0]
    const passwordMatch = await bycrpt.compare(password, user.password)

    if(!passwordMatch) {
        return res.status(401).json({ error: 'Invalid Email or Password'})
    }

    // Remove Sensitive data before Sending
    delete user.password

        res.json ({ message: 'Login Successful', user })
    } catch (err) {
        console.errror('Login Error', err)
        res.status(500).json({ error: 'Server error during Login'})
    }

})