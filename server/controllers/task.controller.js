import { validationResult } from 'express-validator'
import Task from '../models/task.model.js'
import Project from '../models/project.models.js'



const getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Member') {
            query = { assignedTo: req.user._id };
        }
        if (req.query.projectId) query.projectId = req.query.projectId;
        if (req.query.status) query.status = req.query.status;
 
        const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

        return res.json(tasks);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


const getDashboardStats = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role === 'Member') {
        matchQuery = { assignedTo: req.user._id };
        }
    
        const now = new Date();
        const [total, todo, inProgress, completed, overdue, recent] = await Promise.all([
        Task.countDocuments(matchQuery),
        Task.countDocuments({ ...matchQuery, status: 'To-Do' }),
        Task.countDocuments({ ...matchQuery, status: 'In Progress' }),
        Task.countDocuments({ ...matchQuery, status: 'Completed' }),
        Task.countDocuments({ ...matchQuery, deadline: { $lt: now }, status: { $ne: 'Completed' } }),
        Task.find({ ...matchQuery, deadline: { $lt: now }, status: { $ne: 'Completed' } })
            .populate('assignedTo', 'name email')
            .populate('projectId', 'title')
            .limit(5)
            .sort({ deadline: 1 })
        ]);
    
        let projectCount = 0;
        if (req.user.role === 'Admin') {
        projectCount = await Project.countDocuments();
        } else {
        projectCount = await Project.countDocuments({ members: req.user._id });
        }
    
        return res.json({ total, todo, inProgress, completed, overdue, overdueList: recent, projectCount });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title members')
        .populate('createdBy', 'name email');
    
        if (!task) return res.status(404).json({ message: 'Task not found' });
        return res.json(task);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


const createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    
        const task = await Task.create({ ...req.body, createdBy: req.user._id });
        await task.populate('assignedTo', 'name email');
        await task.populate('projectId', 'title');
        await task.populate('createdBy', 'name email');

        return res.status(201).json(task);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Members can only update status of their own tasks
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
    
        if (req.user.role === 'Member') {
        if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Members can only update status
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('assignedTo', 'name email').populate('projectId', 'title');

        return res.json(updatedTask);
        }

        // Admin can update everything
        const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
        ).populate('assignedTo', 'name email').populate('projectId', 'title').populate('createdBy', 'name email');
    
        return res.json(updatedTask);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        return res.json({ message: 'Task deleted successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export {
    getTasks,
    getDashboardStats,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};