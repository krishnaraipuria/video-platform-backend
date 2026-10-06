import {ApiResponse} from "../utils/ApiResponse.js"
import {asyneHandler} from "../utils/asynceHandler.js"


const healthcheck = asyneHandler(async (req, res) => {
   return res.status(200).json(ApiResponse(200, {status: "OK"}, "Healthcheck successful"))
})
export {healthcheck}
