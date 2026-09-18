import cors from "cors";
import express, { Application, Request, Response } from 'express'
import authroutes from './routes/auth.route'
import cookieParser from 'cookie-parser';
import repoRoutes from './routes/repo.routes';
import webhookRoutes from './routes/webhook.route';
import githubRoutes from './routes/github.route';
import analysisRoutes from './routes/analysis.route';

const app:Application= express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use('/api/webhooks/github', express.raw({ type: 'application/json' }));

app.use(express.json())
app.use('/api/auth', authroutes);
app.use(cookieParser());
app.use('/api/repos', repoRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/analyses', analysisRoutes);

app.get('/',(req:Request,res:Response)=>{
    res.json({message:'blast-radius is running'})
})

export default app