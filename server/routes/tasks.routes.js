import express from 'express'
import { authenticate, adminOnly } from '../middleware/auth.middleware.js'
import { createTask, deleteTask, getDashboardStats, getTaskById, getTasks, updateTask } from '../controllers/task.controller.js'

const tasksRouter = express.Router()

tasksRouter.get('/', authenticate, getTasks)

tasksRouter.get('/dashboard', authenticate, getDashboardStats)

tasksRouter.get('/:id', authenticate, getTaskById)

tasksRouter.post('/', authenticate, adminOnly, createTask)

tasksRouter.put('/:id', authenticate, updateTask)

tasksRouter.delete('/:id', authenticate, adminOnly, deleteTask)

export default tasksRouter;