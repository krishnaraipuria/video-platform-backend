import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"
import mongoose,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {Likes} from "../models/like.models.js"
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";


const toogleVideoLike=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const IsValidId=Video.findById(videoId)
    if(!IsValidId){
        throw new ApiError(404,"Video not found")
    }
    const existingLike=await Likes.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Likes.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, null, "Video unliked successfully")
        )
    }
    const addedLike=await Likes.create({
        video:videoId,
        likedBy:req.user._id
    })
    return res.status(200).json(
        new ApiResponse(200,addedLike,"Video liked successfully")
    )
})

const toggleCommentLike=asyneHandler(async(req,res)=>{
    const {commentId}=req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    const existingcomment=await Comment.findById(commentId)
    if(!existingcomment){
        throw new ApiError(404,"Comment not found")
    }
    const existingLike=await Likes.findOne({
        comment:commentId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Likes.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, null, "Comment unliked successfully")
        )
    }
    const addedLike=await Likes.create({
        comment:commentId,
        likedBy:req.user._id
    })
    return res.status(200).json(
        new ApiResponse(200,addedLike,"Comment liked successfully")
    )
})

const toggleTweetLike=asyneHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const existingtweet=await Tweet.findById(tweetId)
    if(!existingtweet){
        throw new ApiError(404,"Tweet not found")
    }
    const existingLike=await Likes.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })
    if(existingLike){
        await Likes.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet unliked successfully")
        )
    }
    const addedLike=await Likes.create({
        tweet:tweetId,
        likedBy:req.user._id
    })
    return res.status(200).json(
        new ApiResponse(200,addedLike,"Tweet liked successfully")
    )
})

const LikedVideos=asyneHandler(async(req,res)=>{
    const userId=req.user._id
    const likedVideos=await Likes.aggregate(
        [{
            $match:{
                likedBy: new mongoose.Types.ObjectId(userId),
                video:{ $exists:true, $ne:null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video"
            }
        },
        {
            $unwind:"$video"
        },
    ])
    return res.status(200).json(
        new ApiResponse(200,likedVideos,"Liked videos fetched successfully")
    )
})
export {toogleVideoLike,toggleCommentLike,toggleTweetLike,LikedVideos}