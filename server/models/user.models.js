import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member'
    }

}, {timestamps: true})


const userModel = mongoose.models.User || mongoose.model("User", userSchema)

export default userModel;