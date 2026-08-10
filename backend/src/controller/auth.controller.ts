import { Request,Response,NextFunction } from 'express'
import User from '../models/user.model'
import apiError from '../utils/apiError'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const{name,email,password}=req.body

        if(!name || !email || !password){
            throw new apiError(400,'name,email,password are required')
        }

        const existinguser = await User.findOne({email})
        if(existinguser) {
            throw new apiError(400,'user already exits')
        }

        const hashedpassword = await bcrypt.hash(password,10)

        const user = await User.create({
            name:name,
            email:email,
            password:hashedpassword
        })

        const token = jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET as string,
            {expiresIn: '7d'}
        )

        res.status(201).json({
            message:'user registered successfully',
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })
    }
    catch(error){
        next(error)
    }
}