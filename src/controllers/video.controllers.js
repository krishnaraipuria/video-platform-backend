import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.models.js"
import mongoose from "mongoose"
import { deleteFromCloudinary } from "../utils/cloudinary.js"


const getallvideos=asyneHandler(async(req,res)=>{
    const {page=1, limit=10, query,sortBy,sortType,userId}=req.query

    const pipeline=[]
    const matchStage={isPublished:true}
    if(query && query.trim()!==""){
        matchStage.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}
        ]
    }
    if(userId && mongoose.Types.ObjectId.isValid(userId)){
        matchStage.owner=new mongoose.Types.ObjectId(userId)
    }
    pipeline.push({$match: matchStage})
    if(sortBy){
        const sortStage={}
        sortStage[sortBy]=sortType==="asc" ? 1 : -1
        pipeline.push({$sort:sortStage})
    }
    else{
        pipeline.push({$sort:{createdAt:-1}})
    }
    pipeline.push(
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            email:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$ownerDetails"
        }
    )
    const videosAggregate=Video.aggregate(pipeline)
    const options={
        page:parseInt(page,10),
        limit:parseInt(limit,10),
    }
    const paginatedVideos=await Video.aggregatePaginate(videosAggregate, options)
    return res.status(200).json(
        new ApiResponse(200,paginatedVideos,"Videos fetched successfully")
    )
})
const publishvideo=asyneHandler(async(req,res)=>{
    const{title,description}=req.body
    if(!title ||title=="" || title.trim()===""){
        throw new ApiError(400,"Title is required")
    }
    if(!description || description=="" || description.trim()===""){
        throw new ApiError(400,"Description is required")
    }
    const videofileLocalPath=req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path

    if(!videofileLocalPath){
        throw new ApiError(400,"Video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const videoFile=await uploadOnCloudinary(videofileLocalPath)
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
    if(!videoFile.url){
        throw new ApiError(500,"Failed to upload video file")
    }
    if(!thumbnail.url){
        throw new ApiError(500,"Failed to upload thumbnail")
    }
    const video=await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title:title,
        description:description,
        duration:videoFile.duration,
        owner:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200,video,"Video published successfully")
    )
})

const getvideoById=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const isValidObjectId=mongoose.Types.ObjectId.isValid
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    if(!videoId){
        throw new ApiError(400,"Invalid video ID")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(!video.isPublished){
        throw new ApiError(403,"Video is not published")
    }

    const updatedvideo=await Video.findByIdAndUpdate(videoId,{$inc:{views:1}},{new:true})
    // console.log("views:", updatedvideo?.views);
    const user=req.user?._id
    if(user){
        await User.findByIdAndUpdate(user,{$addToSet:{watchHistory:videoId}},{new:true})
    }
    return res.status(200).json(
        new ApiResponse(200,updatedvideo,"Video fetched successfully")
    )
})

const updatevideo=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description}=req.body
    const isValidObjectId=mongoose.Types.ObjectId.isValid
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    if((!title || title.trim()==="") && (!description || description.trim()==="")){
        throw new ApiError(400,"Title or description is required")
    }
    const updateFields={}
    if(title && title.trim()!==""){
        updateFields.title=title.trim()
    }
    if(description && description.trim()!==""){
        updateFields.description=description.trim()
    }
    const user=req.user?._id
    const video=await Video.findOneAndUpdate(
        {
            _id:videoId,
            owner:user
        },
        {
            $set: updateFields
        },
        { new: true }
    )
    if(!video){
        throw new ApiError(404,"Video not found or you are not the owner")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"Video updated successfully")
    )
})


const deletevideo=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const isValidObjectId=mongoose.Types.ObjectId.isValid
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const user=req.user?._id
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner.toString()!==user.toString()){
        throw new ApiError(403,"You are not the owner of this video")
    }
    await deleteFromCloudinary(video.videoFile,"video")
    await deleteFromCloudinary(video.thumbnail,"image")
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(
        new ApiResponse(200,video,"Video deleted successfully")
    )
})


const publishstatus=asyneHandler(async(req,res)=>{
    const {videoId}=req.params
    const isValidObjectId=mongoose.Types.ObjectId.isValid
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    video.isPublished=!video.isPublished
    await video.save()
    return res.status(200).json(
        new ApiResponse(200,video,`Video ${video.isPublished ? 'published' : 'unpublished'} successfully`)
    )
})

export {getallvideos,publishvideo,getvideoById,updatevideo,deletevideo,publishstatus}