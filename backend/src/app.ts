import express, { Application, Request, Response } from 'express'
import authroutes from './routes/auth.route'
import cookieParser from 'cookie-parser';

const app:Application= express()

app.use(express.json())
app.use('/api/auth', authroutes);
app.use(cookieParser());

app.get('/',(req:Request,res:Response)=>{
    res.json({message:'blast-radius is running'})
})

export default app