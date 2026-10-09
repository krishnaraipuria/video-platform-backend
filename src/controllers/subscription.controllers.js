import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"
import mongoose,{isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";

const toggleSubcription =asyneHandler(async(req,res)=>{
    const {channelId}=req.params
    const user=req.user._id;
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id!!!")
    }
    const isexist=await User.findById(channelId)
    if(!isexist){
        throw new ApiError(400, "Channel does not exist!!")
    }
    const IsSubscribed=await Subscription.findOne(
        {
            subscriber:user,
            channel:channelId
        }
    )
    if(IsSubscribed){
        await Subscription.findOneAndDelete(
            {
                subscriber:user,
                channel:channelId
            }
        )
        return res.status(200).json(
            new ApiResponse(200,{},"Unsubscribed successfully!!!")
        )
    }

    const Subscribed=await Subscription.create(
        {
            subscriber:user,
            channel:channelId
        }
    )
    return res.status(200).json(
            new ApiResponse(200,Subscribed,"Subscribed successfully!!!")
    )
})

//controller to return subscriber list of a channel
const getUserChannelSubcribers=asyneHandler(async(req,res)=>{
    const {subscriberId}=req.params
    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid Channel Id!!!")
    }
    const isexist=await User.findById(subscriberId)
    if(!isexist){
        throw new ApiError(400, "Channel does not exist!!")
    }
    const UserSubcribers=await Subscription.find(
        {
            channel:subscriberId,
        }
    ).populate(
        "subscriber",
        "username fullname avatar"
    )

    return res.status(200).json(
        new ApiResponse(200,UserSubcribers,"Fetched Users Subscribers!!!")
    )
})


//controller to return channel list to which user has subscribed
const getSubcribedChannels=asyneHandler(async(req,res)=>{
    const {channelId}=req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invaild Subscriber!!!")
    }

    const isexist=await User.findById(channelId)
    if(!isexist){
        throw new ApiError(400, "User does not exist!!")
    }

    const TotalSubscriptions=await Subscription.find(
        {
            subscriber:channelId
        },
    ).populate("channel",
        "username fullname avatar"
    )

    return res.status(200).json(
        new ApiResponse(200, TotalSubscriptions, "Subscription Fetched Successfully!!!!")
    )
})

export {toggleSubcription,getUserChannelSubcribers,getSubcribedChannels}