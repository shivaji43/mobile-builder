import type { Request , Response, NextFunction } from "express";
import jwt, { verify } from "jsonwebtoken";

export function authMiddleware(req:Request,res:Response ,next:NextFunction){
    const token = req.headers.authorization;

    if(!token){
        res.status(401).json({ message:"Unauthorized"});
        return;
    }

    const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
    if (!jwtPublicKey) {
        console.error('JWT_PUBLIC_KEY environment variable is not defined');
        res.status(500).json({message:"Internal Server Error"});
        return;
    }

    const decoded = jwt.verify(token, jwtPublicKey,{algorithms : ["RS256"]});
    const userId = (decoded as any).payload.sub
    req.userId = userId;
    
    next()
}