//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectdb from "./db/index.js";
dotenv.config({
    path: './env'
})

connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log("ERRR:",error);
        throw error
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed!!",err)
})