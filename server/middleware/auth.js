import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    console.log('Authorization Header:', authHeader) // <--- Debug log

    const token = authHeader && authHeader.split(' ')[1]
    console.log('Extracted Token:', token)

    if (!token) return res.status(403).json({ error: 'No Token Provided'})

    jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, decoded) => {
        if (err) {
            console.log('JWT Verify Error:', err)
            return res.status(401).json({ error: 'Unauthorized' })
        } 
        console.log('Decoded User:', decoded)
        req.user = decoded
        next()
    })
}
