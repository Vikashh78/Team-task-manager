import User from '../models/user.models.js'

// Users - Admin can see all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({
            createdAt: -1
        })
        return res.status(200).json(users)

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// Members - All authenticated users can see members
const getAllMembers = async (req, res) => {
    try {
        const members = await User.find({
            role: 'Member'
        }).select('name email role')
        
        return res.status(200).json(members)

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

// update role
const updateUserRole = async (req, res) => {
    try {
        const {role} = req.body
        if(!['Admin', 'Member'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        )

        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user)
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

export {
    getAllUsers,
    getAllMembers,
    updateUserRole
}

