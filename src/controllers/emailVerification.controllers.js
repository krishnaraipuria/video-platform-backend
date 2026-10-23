import { asyneHandler } from "../utils/asynceHandler.js";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import redis from "../config/redis.js";
import sendEmailVerificationByResend from "../services/emailVerification.service.js";
import { randomInt } from "node:crypto";
    
const sendEmailVerification=asyneHandler(async(req,res)=>{
    const {email}=req.body;
    if(!email){
        throw new ApiError(400,"Email is required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const otpkey= `emailverification:${normalizedEmail}`;
    const verfiedKey= `emailverified:${normalizedEmail}`;
    const verificationCode=randomInt(100000, 1000000).toString();
    await redis.del(verfiedKey);
    await redis.set(otpkey,verificationCode,"EX",300);
    try{
        await sendEmailVerificationByResend(normalizedEmail,verificationCode);
    }catch(error){
        await redis.del(otpkey);
        throw new ApiError(500,"Failed to send email verification code");
    }

    return res.status(200).json(
        new ApiResponse(200,null,"Verification code sent to email")
    )
})

const emailVerification=asyneHandler(async(req,res)=>{
    const {email,verificationCode}=req.body;
    if(!email || !verificationCode){
        throw new ApiError(400,"Email and verification code are required");
    }
    if(!/^\d{6}$/.test(verificationCode)){
        throw new ApiError(400,"Invalid verification code");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const otpkey= `emailverification:${normalizedEmail}`;
    const verfiedKey= `emailverified:${normalizedEmail}`;

    const savedVerificationCode=await redis.get(otpkey);
    if(!savedVerificationCode){
        throw new ApiError(400,"Verification code expired or not found");
    }
    if(savedVerificationCode!==verificationCode){
        throw new ApiError(400,"Invalid verification code");
    }

    await redis                 
        .multi()
    .set(verfiedKey, "true", "EX", 600)
    .del(otpkey)
    .exec();

    return res.status(200).json(
        new ApiResponse(200,null,"Email verified successfully")
    )

})
export {sendEmailVerification,emailVerification}