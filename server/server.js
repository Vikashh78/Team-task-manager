import express, { json } from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.config.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import tasksRouter from './routes/tasks.routes.js';

const port = process.env.PORT || 5000;

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))
app.use(json())

connectDB();

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter)
app.use('/api/tasks', tasksRouter)


app.get('/api/status', (req, res) => {
    res.send('API is running');
})

app.listen(port, () => {
    console.log("Server is running at :", port);
})