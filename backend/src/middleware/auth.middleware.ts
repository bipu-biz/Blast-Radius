import { Request, Response, NextFunction } from "express";
import apiError from "../utils/apiError";
import jwt from 'jsonwebtoken'
import User from '../models/user.model'

export const isloggedin = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const token = 
        req.cookies?.accesstoken ||
        req.headers['authorization']?.replace('Bearer ','').trim()

        if(!token){
            throw new apiError(401,'not logged in')
        }

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string) as { _id: string }
        const user = await User.findById(decoded._id).select('-password')
        if(!user){
            throw new apiError(401, 'user not found')
        }

        req.user = user
        next()
    }
    catch(error){
        next(error)
    }
}