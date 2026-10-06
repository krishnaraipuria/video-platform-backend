import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/APiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"


//yet to write the logic;;
const getallvideos=asyneHandler(async(req,res)=>{
    const {page=1, limit=10, query,sortBy,userId}=req.query


})
const publishvideo=asyneHandler(async(req,res)=>{

})

const getvideoById=asyneHandler(async(req,res)=>{

})


const updatevideo=asyneHandler(async(req,res)=>{

})


const deletevideo=asyneHandler(async(req,res)=>{

})


const publishstatus=asyneHandler(async(req,res)=>{

})
export {getallvideos,publishvideo,getvideoById,updatevideo,deletevideo,publishstatus}