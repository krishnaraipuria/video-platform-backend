import { asyneHandler } from "../utils/asynceHandler.js";
import { ApiError } from "../utils/APiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const generateAccessAndrefreshAccess= async(userId)=>{
        try{
            const user=await User.findById(userId)
            const accesstoken=await user.generateAccessToken()
            const refreshtoken=await user.generateRefreshToken()

            user.refreshToken=refreshtoken
            await user.save({validateBeforeSave: false})

            return {accesstoken,refreshtoken}
        }catch(error){
            throw new ApiError(500, "something went worng while generating refresh and access token")
        }
    }
   //get user details from frontend
   //checks not missing values or unique(by email,name);
   //checks for image and upload cloudinary
   //create user objects - create entry in db
   //remove and password from response;
   //return;
const registerUser = asyneHandler( async (req, res) =>{
    const {fullname,email, username,password }=req.body
    const fields=[fullname,email, username,password];

    if(fields.some((field)=> !field || field.trim()===""))
        {
            throw new ApiError(400,"ALL fields are required!")
        }

    const Isexisteduser= await User.findOne({
        $or: [{username},{email}]
    })
    if(Isexisteduser){
        throw new ApiError(409, "User with email or username already exist")
    }
   const avatarlocalPath=req.files?.avatar[0]?.path
   //const coverImagelocalpath=req.files?.coverImage[0]?.path;

   let coverImagelocalpath;
   if(req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length>0){
    coverImagelocalpath=req.files.coverImage[0].path
   }

   if(!avatarlocalPath)
    {
        throw new ApiError(400,"Avatar file is reuired!")
    }
    const avatar=await uploadOnCloudinary(avatarlocalPath)
    const coverImage=await uploadOnCloudinary(coverImagelocalpath)
    if(!avatar)
    {
        throw new ApiError(400,"Avatar file is reuired!");
    }
    const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //edge case types;
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"something wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

// user/loginUser;
        // user sends details for login;
        //check if user or email are same and exist;
        //password check;
        // access,refresh token,and in cookie;
const loginUser=asyneHandler( async (req,res)=>{
    const {username,email,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"username or password is required");
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const ispasswordvalid=await user.isPasswordCorrect(password);

    if(!ispasswordvalid){
        throw new ApiError(401,"Password incorrect!!")
    }

    //send in cookies
    const {accesstoken,refreshtoken}=await generateAccessAndrefreshAccess(user._id)
    //console.log(accesstoken)
    const loggedInuser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options ={
        httpOnly: true,
        secure:true
    }
    return res.status(200).cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(200,{
            user:loggedInuser,accesstoken,refreshtoken

        },
            "User logged in Successfully!!"
        )
    )
})

const logoutUser= asyneHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new ApiResponse(200,{},"User logged Out!!!")
    )
})

const refreshAccessToken = asyneHandler(async(req,res)=>{
    
    const incomingRefreshToken=req.cookies.refreshtoken || req.body.refreshtoken
    // console.log(incomingRefreshToken)
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedtoken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user=await User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token!!")
        }
    
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired!!")
        }
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,refreshtoken}=await generateAccessAndrefreshAccess(user._id)
        return res.status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshtoken",refreshtoken,options)
        .json(
            new ApiResponse(
                200,
                {accesstoken,refreshtoken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refersh token!!")
    }
})

const changeCurrentPassword = asyneHandler(async(req,res)=>{
    const {oldPassword, newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const ispassword=await user.isPasswordCorrect(oldPassword)
    if(!ispassword){
        throw new ApiError(400, "Invalid old Password!!!")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed!!")
    )
})
const getCurrentUser=asyneHandler(async(req,res)=>{
    return res.status(200).json(
        200,req.user,"Current user details!!"
    )
})

const updateAccountUser=asyneHandler(async(req,res)=>{
    const {fullname, email}=req.body

    if(!fullname || !email){
        throw new ApiError(400,"All fields are required!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new:true}

    ).select("-password")

    return res
    .status(200).json(
        new ApiResponse(200,user,"Account details updated successfully")
    )
})

const updateuserAvater=asyneHandler(async(req,res)=>{
    const avaterlocalpath=req.file?.path
    if(!avaterlocalpath){
        throw new ApiError(400,"Avater file is missing!!")
    }
    const avater=await uploadOnCloudinary(avaterlocalpath)

    if(!avater.url){
        throw new ApiError(400,"Error while uploading while avater!!!")
    }
    await deleteFromCloudinary(req.user?.avatar,"image")
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avater.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200).json(
        new ApiResponse(200,user,"Avatar updated!!!")
    )
})

const updateusercoverimage=asyneHandler(async(req,res)=>{
    const coverlocalpath=req.file?.path
    if(!coverlocalpath){
        throw new ApiError(400,"coveriamge file is missing!!")
    }
    const coverimage=await uploadOnCloudinary(coverlocalpath)

    if(!coverimage.url){
        throw new ApiError(400,"Error while uploading while coverimage!!!")
    }
    await deleteFromCloudinary(req.user?.coverImage,"image")
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverimage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200).json(
        new ApiResponse(200,user,"CoverImage updated!!!")
    )
})



const getUserChannelProfile=asyneHandler(async(req,res)=>{
    const{username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing!!!")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            },
        },
        //find subscribers thro channel
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        //find subscribers that you subcribed
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as:"subscribedTo"
            }
        },
        //addFields;
        {
            $addFields:{
                subcriberscount:{
                    $size: "$subscribers"
                },
                channelsSubcribedtoCount:{
                    $size:"$subscribedTo"
                },
                isSubsribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        //final projection;
        {
            $project:{
                fullname:1,
                username:1,
                subcriberscount:1,
                channelsSubcribedtoCoun:1,
                isSubsribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
    ])
    
    if(!channel?.length){
        throw new ApiError(404,"channel does not exists!!")
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully!!"))
})


const getWatchHistory=asyneHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
    ])
    return res.status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"fetch watch history !!")
    )
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountUser,updateuserAvater,updateusercoverimage
    ,getUserChannelProfile,getWatchHistory
}