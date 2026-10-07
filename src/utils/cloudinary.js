import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch(error){
        fs.unlinkSync(localFilePath) //remove the temp file;
        console.log("Error!! file uploading on cloudinary");
        return null;
    }
}

const deleteFromCloudinary=async(url,resourceType)=>{
    try{
        if(!url) return null
        const publicId=url.split("/").pop().split(".")[0]
        const response=await cloudinary.uploader.destroy(publicId,{resource_type:resourceType})
        return response
    } catch(error){
        console.log("Error!! file deleting from cloudinary");
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}