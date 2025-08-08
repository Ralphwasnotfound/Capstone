import { DataTypes } from 'sequelize'

import { sequelize } from '../db.js'

const Student = sequelize.define('Student', {
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    student_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enrollment_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    } 
}, {
    tableName: 'students',
    timestamps: true
})