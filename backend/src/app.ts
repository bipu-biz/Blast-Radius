import express, { Application, Request, Response } from 'express'
import authroutes from './routes/auth.route'
import cookieParser from 'cookie-parser';
import repoRoutes from './routes/repo.routes';
import webhookRoutes from './routes/webhook.route';

const app:Application= express()

app.use('/api/webhooks/github', express.raw({ type: 'application/json' }));

app.use(express.json())
app.use('/api/auth', authroutes);
app.use(cookieParser());
app.use('/api/repos', repoRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/',(req:Request,res:Response)=>{
    res.json({message:'blast-radius is running'})
})

export default app