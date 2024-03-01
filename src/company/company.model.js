'use strict'

import { Schema, model } from 'mongoose';

// Función para eliminar la información de la hora de una fecha
const stripTime = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const companySchema = Schema({
    name: {
        type: String,
        unique: [true, 'name must be unique'],
        required: [true, 'name is required.']
    },
    address: {
        type: String,
        required: [true, 'address is required.']
    },
    phone: {
        type: String,
        minLength: [8, 'The phone number must be 8 digits long.'],
        maxLength: [8, 'The phone number must be 8 digits long.'],
        required: [true, 'phone is required.']
    },
    email: {
        type: String,
        unique: [true, 'email must be unique'],
        required: [true, 'email is required.']
    },
    impactLevel: {
        type: String,
        enum: ['BAJO', 'MEDIO', 'ALTO'],
        required: [true, 'impactLevel is required.']
    },
    foundedAt: {
        type: Date,
        required: [true, 'founded date is required.'],
        set: stripTime
    },
    yearsTrajectory:{
        type: Number,
        required: [true, 'years of trajectory is required.']
    },
    category: {
        type: Schema.ObjectId,
        required: [true, 'category Id is required.']
    }
}, {
    versionKey: false
})

export default model('Company', companySchema);