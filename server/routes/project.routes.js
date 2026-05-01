import express from 'express'
import { addProjectMember, createNewProject, deleteProject, getAllProject, getProjectById, removeProjetMember, updateProject } from '../controllers/project.controller.js';
import { adminOnly, authenticate } from '../middleware/auth.middleware.js';

const projectRouter = express.Router();

projectRouter.get('/', authenticate, getAllProject)

projectRouter.get('/:id', authenticate, getProjectById)

projectRouter.post('/', authenticate, adminOnly, createNewProject)

projectRouter.put('/:id', authenticate, adminOnly, updateProject)

projectRouter.delete('/:id', authenticate, adminOnly, deleteProject)

projectRouter.post('/:id/members', authenticate, adminOnly, addProjectMember)

projectRouter.delete('/:id/members/:userId', authenticate, adminOnly, removeProjetMember)


export default projectRouter;