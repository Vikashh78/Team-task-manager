import express from 'express'
import { adminOnly, authenticate } from '../middleware/auth.middleware.js';
import { getAllMembers, getAllUsers, updateUserRole } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/', authenticate, getAllUsers)
userRouter.get('/members', authenticate, getAllMembers)
userRouter.put('/:id/role', authenticate, adminOnly, updateUserRole)

export default userRouter;