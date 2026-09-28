import { Request, Response, NextFunction } from "express";
import apiError from "../utils/apiError";
import jwt from 'jsonwebtoken'
import User from '../models/user.model'
import { FRONTEND_URL , baseCookieOptions } from "../utils/config";

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

export const ensureValidSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accesstoken = req.cookies?.accesstoken;
    if (accesstoken) {
      const decoded = jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string };
      const user = await User.findById(decoded._id);
      if (!user) return res.redirect(`${FRONTEND_URL}/login`);
      req.user = user;
      return next();
    }
    throw new Error("expired");
  } catch {
    const refreshtoken = req.cookies?.refreshtoken;
    if (!refreshtoken) return res.redirect(`${FRONTEND_URL}/login`);

    try {
      const decoded = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET as string) as { _id: string };
      const user = await User.findById(decoded._id);
      if (!user || user.refreshToken !== refreshtoken) {
        return res.redirect(`${FRONTEND_URL}/login`);
      }
      const newAccessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
      res.cookie('accesstoken', newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000 });
      req.user = user;
      next();
    } catch {
      return res.redirect(`${FRONTEND_URL}/login`);
    }
  }
};