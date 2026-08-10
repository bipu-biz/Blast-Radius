import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId:string):string =>{
    return jwt.sign(
        {_id:userId},
        process.env.ACCESS_TOKEN_SECRET as string,
        {expiresIn: '15m'}

    )
}

export const generateRefreshToken = (userId:string):string =>{
    return jwt.sign(
        {_id:userId},
        process.env.REFRESH_TOKEN_SECRET as string,
        {expiresIn: '7d'}

    )
}

export default { generateAccessToken, generateRefreshToken };