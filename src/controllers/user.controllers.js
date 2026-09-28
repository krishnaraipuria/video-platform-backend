import { asyneHandler } from "../utils/asynceHandler.js";
import { ApiError } from "../utils/APiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log(req.fil)
   const avatarlocalPath=req.files?.avatar[0]?.path
   const coverImagelocalpath=req.files?.coverImage[0]?.path;

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
export {registerUser}