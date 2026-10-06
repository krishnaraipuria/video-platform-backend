import mongoose from "mongoose";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyneHandler } from "../utils/asynceHandler.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";

const getvideocomments=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

    const isvalidID=mongoose.isValidObjectId(videoId)
    if(!isvalidID){
        throw new ApiError(400,"Invalid video ID")
    }
    const comments=await Comment.find({video:videoId}).sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,comments,"fetched comments of this videos")
    )
})

const addcomment=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const {content}=req.body
    const user=req.user?._id
    if(!user){
        throw new ApiError(401,"Unauthorized access");
    }

    const isvalidID=mongoose.isValidObjectId(videoId)

    if(!isvalidID){
        throw new ApiError(400,"Invalid video ID")
    }
    if(!content|| content.trim()===""){
        throw new ApiError(400,"invalid comment")
    }
    const findvideo=await Video.findById({videoId})
    if(!findvideo){
        throw new ApiError(400,"Video not found!!")
    }
    const addcomm=await Comment.create({
        content,
        video:videoId,
        owner: user
    })
    if(!addcomm){
        throw new ApiError(400,"failed to add comment!!!")
    }
    return res.status(200).json(
        200,addcomm,"ADD comment successfully!!"
    )
})

const updatecomment=asyneHandler(async(req,res)=>{
    const {commentId}=req.params
    const user=req.user?._id
    const {content}=req.body
    if(!user){
        throw new ApiError(401,"Unauthorized access");
    }
    if(!content|| content.trim()===""){
        throw new ApiError(400,"invalid comment")
    }
    const isvalidID=mongoose.isValidObjectId(commentId)

    if(!isvalidID){
        throw new ApiError(400,"Invalid comment ID")
    }
    const updatecomm=await Comment.findByIdAndUpdate(
        {
            _id:commentId,
            owner:user
        },
        {
            $set:{content:content.trim()}
        },
        {
            new:true,
        }
    )
    if(!updatecomm){
        throw new ApiError(404,"Comment not found or you are not the owner of the comment!!!")
    }
    return res.status(200).json(
        new ApiResponse(200,updatecomm,"Update your comment successfully!!!")
    )
})

const deletecomment=asyneHandler(async(req,res)=>{
    const {commentId}=req.params
    const user=req.user?._id
    if(!user){
        throw new ApiError(401,"Unauthorized access");
    }
    const isvalidID=mongoose.isValidObjectId(commentId)

    if(!isvalidID){
        throw new ApiError(400,"Invalid comment ID")
    }
    const deletecomm=await Comment.findByIdAndDelete(
        {
            _id:commentId,
            owner:user
        }
    )
    if(!deletecomm){
        throw new ApiError(404,"Comment not found or you are not the owner of the comment!!!")
    }
    return res.status(200).json(
        new ApiResponse(200,deletecomm,"comment delete successfully!!!")
    )
})

export{getvideocomments,addcomment,updatecomment,deletecomment}