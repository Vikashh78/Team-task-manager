import jwt from 'jsonwebtoken'
import User from '../models/user.models.js'

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "No token provided"
            })
        }

        const token = authHeader?.split(' ')[1];
        const decoded_token = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

        const user = await User.findById(decoded_token.id)
        if(!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
        
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}

const adminOnly = (req, res, next) => {
    if(req.user.role !== 'Admin') {
        return res.status(401).json({
            message: "Access denied! Admins only."
        })
    }
    next();
}

export {
    authenticate,
    adminOnly
}