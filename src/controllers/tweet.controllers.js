import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"
import mongoose,{isValidObjectId} from "mongoose"
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";

const createtweet=asyneHandler(async(req,res)=>{
    const {content}=req.body
    const user=req.user._id
    if(!content || content.trim()===""){
        throw new ApiError(400,"Invalid tweet content")
    }
    const newTweet=await Tweet.create({
        content:content.trim(),
        owner:user
    })
    return res.status(200).json(
        new ApiResponse(200,newTweet,"Tweet created successfully")
    )
})

const getUserTweets=asyneHandler(async(req,res)=>{
    const {userId}=req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const IsUserExist= await User.findById(
        {
            _id:userId,
        }
    )
    if(!IsUserExist){
        throw new ApiError(400,"User does not exist!!")
    }
    const tweet=await Tweet.find(
        {
            owner:userId
        }
    ).sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweets fetched successfully")
    )
})

const updateTweet=asyneHandler(async(req,res)=>{
    const {tweetId}=req.params
    const {content}=req.body
    const userId=req.user._id
    if(!content || content.trim()===""){
        throw new ApiError(400,"Invalid tweet content")
    }
    
    const updateTwet=await Tweet.findOneAndUpdate(
        {
            _id:tweetId,
            owner:userId,
        },
        {
            $set:{content:content},
        }
    )
    if(!updateTwet){
        throw new ApiError(400,"Tweet Isn't exist or you are not the owner!!!")
    }
    return res.status(200).json(
        new ApiResponse(200,updateTwet,"Your tweet is updated!!!")
    )
})

const deleteTweet=asyneHandler(async(req,res)=>{
    const {tweetId}=req.params
    const userId=req.user._id

    const deletetweet=await Tweet.findOneAndDelete({
        _id:tweetId,
        owner:userId,
    }
    )
    if(!deletetweet){
        throw new ApiError(400,"Tweet Isn't exist or you are not the owner!!!");
    }
    return res.status(200).json(
        new ApiResponse(200,deletetweet,"Your tweet is deleted successfully!!!")
    )

})

export {createtweet,getUserTweets,updateTweet,deleteTweet}