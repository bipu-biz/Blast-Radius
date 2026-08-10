import { Request,Response,NextFunction } from 'express'
import User from '../models/user.model'
import apiError from '../utils/apiError'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken'

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

        const accesstoken = generateAccessToken(user._id.toString())
        const refreshtoken = generateRefreshToken(user._id.toString())

        res.cookie('refreshtoken',refreshtoken,{
            httpOnly:true,
            secure:process.env.NODE_ENV ==='production',
            sameSite: 'strict',
            maxAge: 7*24*60*60*1000

        })

        res.status(201).json({
            message:'user registered successfully',
            accesstoken,
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