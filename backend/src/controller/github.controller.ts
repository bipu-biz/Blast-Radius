import {Request,Response, NextFunction } from "express"
import axios from "axios";
import apiError from "../utils/apiError"
import User from "../models/user.model"

export const githubConnect = (req:Request,res:Response)=>{
    const redirectUri = process.env.GITHUB_CALLBACK_URL as string
    const clientId = process.env.GITHUB_CLIENT_ID as string
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`

    res.redirect(githubAuthUrl)
}

export const githubCallback = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {code}= req.query;

        if(!code){
            throw new apiError(400,'no cdoe provided by github')
        }
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            {
                headers:{Accept:'application/json'}
            }
        )

        const githubAccessToken = tokenResponse.data.access_token

        if(!githubAccessToken){
            throw new apiError(400,'failed to get access token from github')
        }
        if (!req.user) {
      throw new apiError(401, "unauthorized");
    }

    await User.findByIdAndUpdate(req.user._id, {
      githubaccesstoken: githubAccessToken,
    });

    res.status(200).json({
      success: true,
      message: "github account connected successfully",
    });
    }
    catch (error) {
    next(error);
  }
}