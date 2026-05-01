import express from 'express'
import { getUser, login, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/signup', register)
authRouter.post('/login', login)
authRouter.get('/me', authenticate, getUser)

export default authRouter;