const asyneHandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}


export {asyneHandler}


//try and catch;)
// const asynceHandler=(fn)=>async (req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     } catch(error){
//         res.status(err.code || 500).json({
//             sucess:false,
//             message:err.message
//         })
//     }
// }