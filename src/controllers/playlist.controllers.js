import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyneHandler } from "../utils/asynceHandler.js";
import { Playlists } from "../models/playlist.models.js";
import mongoose from "mongoose";
import { Video } from "../models/video.models.js";


const createPlaylist=asyneHandler(async(req,res)=>{
    const{name,description}=req.body
    const user=req.user?._id
    if(!user || !name || !description){
        throw new ApiError(400,"Invalid request")
    }
    const createPlaylist=await Playlists.create({
        name:name,
        description:description,   
        videos:[], 
        owner:user,
    })
    if(!createPlaylist){
        throw new ApiError(500,"Failed to create playlist")
    }
    return res.status(201).json(new ApiResponse(201,createPlaylist,"Playlist created successfully"))
})

const getuserPlaylists=asyneHandler(async(req,res)=>{
    const {userId}=req.params
    if(!userId){
        throw new ApiError(400,"Invalid request")
    }
    const playlists=await Playlists.find({owner:userId})

    if(!playlists){
        throw new ApiError(404,"No playlists found for this user")
    }

    return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched successfully"))
})


const getplaylistByid=asyneHandler(async(req,res)=>{
    const{playlistId}=req.params
    if(!playlistId){
        throw new ApiError(400,"Invalid request")
    }
    const playlist=await Playlists.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))

})

const addvideotoPlaylist=asyneHandler(async(req,res)=>{
    const {videoId,playlistId}=req.params
    const user=req.user?._id
    const isvalidVideoId=mongoose.isValidObjectId(videoId)
    const isvalidPlaylistId=mongoose.isValidObjectId(playlistId)

    if(!isvalidVideoId || !isvalidPlaylistId){
        throw new ApiError(400,"Invalid request")
    }
    const isvideoexist=await Video.findById(videoId)
    if(!isvideoexist){
        throw new ApiError(404,"Video not found")
    }
    const addvideo=await Playlists.findByIdAndUpdate(
        {
            playlistId,
            owner:user
        },
        {
            $addToSet:{videos:videoId}
        },
        {
            new:true
        }
    )
    if(!addvideo){
        throw new ApiError(500,"Playlist not found or you are not the owner !!")
    }
    return res.status(200).json(new ApiResponse(200,addvideo,"Video added to playlist successfully"))
})


const removevideofromPlaylist=asyneHandler(async(req,res)=>{
    const {videoId,playlistId}=req.params
    const user=req.user?._id
    const isvalidVideoId=mongoose.isValidObjectId(videoId)
    const isvalidPlaylistId=mongoose.isValidObjectId(playlistId)

    if(!isvalidVideoId || !isvalidPlaylistId){
        throw new ApiError(400,"Invalid request")
    }
    const isvideoexist=await Video.findById(videoId)
    if(!isvideoexist){
        throw new ApiError(404,"Video not found")
    }
    const isplaylistexist=await Playlists.findById(playlistId)
    if(!isplaylistexist){
        throw new ApiError(404,"Playlist not found")
    }
    const removevideo=await Playlists.findByIdAndUpdate(
        {
            playlistId,
            owner:user
        },
        {
            $pull:{videos:videoId}
        },
        {
            new:true
        }
    )
    if(!removevideo){
        throw new ApiError(500,"Failed to remove video from playlist or you are not the owner !!")
    }
    return res.status(200).json(new ApiResponse(200,removevideo,"Video removed from playlist successfully"))

})

const deletePlaylist=asyneHandler(async(req,res)=>{
    const {playlistId}=req.params
    const user=req.user?._id
    const isvalidPlaylistId=mongoose.isValidObjectId(playlistId)

    if(!isvalidPlaylistId){
        throw new ApiError(400,"Invalid request")
    }
    const isplaylistexist=await Playlists.findById(playlistId)
    if(!isplaylistexist){
        throw new ApiError(404,"Playlist not found")
    }
    if(isplaylistexist.owner.toString() !== user.toString()){
        throw new ApiError(403,"You are not the owner of this playlist")
    }
    const deletedplaylist=await Playlists.findByIdAndDelete(playlistId)
    if(!deletedplaylist){
        throw new ApiError(500,"Failed to delete playlist")
    }
    return res.status(200).json(new ApiResponse(200,deletedplaylist,"Playlist deleted successfully"))
})


const updatePlaylist=asyneHandler(async(req,res)=>{
    const {playlistId}=req.params
    const user=req.user?._id
    const {name,description}=req.body
    const isvalidPlaylistId=mongoose.isValidObjectId(playlistId)
    if(!isvalidPlaylistId){
        throw new ApiError(400,"Invalid request")
    }
    if(!name && !description){
        throw new ApiError(400,"Name or description is required")
    }
    const playlist=await PlayLists.findByIdAndUpdate(
        {
            playlistId,
            owner:user
        },
        {
            $set:{
                name:name,
                description:description
            }
        },
        {
            new:true
        }   
    )
    if(!playlist){
        throw new ApiError(500,"Failed to update playlist or you are not the owner !!")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})
export {createPlaylist,getuserPlaylists,getplaylistByid,addvideotoPlaylist,removevideofromPlaylist,deletePlaylist,updatePlaylist}