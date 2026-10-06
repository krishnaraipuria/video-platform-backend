import { asyneHandler } from "../utils/asynceHandler.js";
import { ApiError } from "../utils/APiError.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";

const getchannelstats = asyneHandler(async (req, res) => {
    const user=req.user?._id
    if(!user){
        throw new ApiError(401,"Unauthorized access");
    }
    const totalSubcribers=await Subscription.countDocuments({channel: user})
    const videostatus=await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(user)
            }
        },
        {
            $lookup:{
                from:"Likes",
                localField:"_id",
                foreignField:"video",
                as:"likes",
            }
        },
        {
            $group:{
                _id: null,
                totalvideos:{$sum:1},
                totalviews:{$sum: "$views"},
                totallikes:{$sum:{$size:"$likes"}}
            }
        }
    ])
    const stats = videostatus[0] || {
        totalvideos: 0,
        totalviews: 0,
        totallikes: 0
    }

    const channelStats = {
        totalSubcribers,
        totalVideos: stats.totalvideos,
        totalViews: stats.totalviews,
        totalLikes: stats.totallikes
    }
    return res.status(200).json(new ApiResponse(200, channelStats, "fetched channel status or details!!"))
})

const getchannelvideos = asyneHandler(async (req, res) => {
    const user=req.user?._id

    if(!user){
        throw new ApiError(401,"Unauthorized access");
    }

    const videos=await Video.find({owner:user}).sort({createdAt:-1})

    return res.status(200).json(new ApiResponse(200, videos, "All videos of the channel fetched!!!"))
})

export { getchannelstats, getchannelvideos}