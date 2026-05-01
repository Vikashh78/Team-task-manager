import { validationResult } from 'express-validator'
import Project from '../models/project.models.js'
import Task from '../models/task.model.js'

// Get all projects
const getAllProject = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Member') {
            query = { members: req.user._id };
        }
        const projects = await Project.find(query)
            .populate('createdBy', 'name email')
            .populate('members', 'name email role')
            .sort({ createdAt: -1 });

        res.json(projects);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Get single projects
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('members', 'name email role');
    
        if (!project) return res.status(404).json({ message: 'Project not found' });
 
        if (req.user.role === 'Member' && !project.members.some(m => m._id.equals(req.user._id))) {
            return res.status(403).json({ message: 'Access denied' });
        }
 
        res.status(200).json(project);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// new project
const createNewProject = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
 
        const { title, description, members } = req.body;
        const project = await Project.create({
        title, description,
        createdBy: req.user._id,
        members: members || []
        });
 
        await project.populate('createdBy', 'name email');
        await project.populate('members', 'name email role');

        res.status(201).json(project);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


// update project
const updateProject = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
 
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email').populate('members', 'name email role');
 
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json(project);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// delete
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
    

        await Task.deleteMany({ projectId: req.params.id });
    
        res.json({ message: 'Project deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// add new member
const addProjectMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
 
        if (!project.members.includes(userId)) {
            project.members.push(userId);
            await project.save();
        }
 
        await project.populate('members', 'name email role');

        res.json(project);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// remove member
const removeProjetMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
 
        project.members = project.members.filter(m => !m.equals(req.params.userId));
        await project.save();
        await project.populate('members', 'name email role');

        res.json(project);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export {
    getAllProject,
    getProjectById,
    createNewProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjetMember
}