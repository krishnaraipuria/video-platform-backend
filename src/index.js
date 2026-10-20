//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectdb from "./db/index.js";
import { app } from "./app.js";
import redis from "./config/redis.js";
dotenv.config({
    path: './env'
})
import dns from "dns";
//

const startserver=async()=>{
    try{
        await connectdb();
        console.log("MongoDB connection successful");
        await redis.ping();
        console.log("Redis connection successful");


         app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
        })
    } catch(err){
        console.log("Server startup failed:", err);
    }
}
startserver();


// connectdb()
// .then(async ()=>{
//     await redis.ping();
//     console.log("Redis connection successful");
//         app.listen(process.env.PORT || 8000,()=>{
//         console.log(`Server is running at port :${process.env.PORT}`)
//         })
//         app.on("error",(error)=>{
//             console.log("ERRR:",error);
//             throw error
//         })
//     })
//     .catch((err)=>{
//         console.log("Redis connection failed!!",err)
//     })
// .catch((err)=>{
//     console.log("MONGO db connection failed!!",err)
// })