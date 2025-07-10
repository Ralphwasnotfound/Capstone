import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

export const studentDB = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_STUDENTS_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

export const userDB = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERS_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

;(async () => {
    try {
        const conn1 = await studentDB.getConnection()
        console.log('MySql Connection Established')
        conn1.release()

        const conn2 = await userDB.getConnection()
        console.log('MySql Connection Established')
        conn1.release()


    } catch (err) {
        console.error('Mysql Connection Failed:', err.message)
    }
})()

