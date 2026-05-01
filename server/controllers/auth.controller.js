import User from '../models/user.models.js'
import generateToken from '../config/token.js'
import bcrypt from 'bcryptjs'

// User registration
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({email});
        if(existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        const hashed_pass = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed_pass,
            role: role || 'Member'
        })

        const token = generateToken(user._id);

        return res.status(201).json({
            user,
            token,
            message: "User registered successfully"
        })

    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        })
    }
}

// login
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({email})
        if(!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = generateToken(user._id)

        return res.status(200).json({
            token,
            user,
            message: "Logged in successfully"
        })

    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        })
    }
}

// Get user
const getUser = (req, res) => {
    try {
        return res.status(200).json({
            user: req.user
        })

    } catch (error) {
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        })
    }
}

export{
    register,
    login,
    getUser
}