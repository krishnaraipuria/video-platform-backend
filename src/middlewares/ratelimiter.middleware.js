import redis from "../config/redis.js";
import { asyneHandler } from "../utils/asynceHandler.js";
import { ApiError } from "../utils/APiError.js";
import crypto from "crypto";

//using sliding window log algorithm for rate limiting;

const windowMs = 60_000;
const maxRequests = 120;

const rateLimitScript = `
local key = KEYS[1]
local currentTime = tonumber(ARGV[1])
local windowStart = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])
local uniqueMember = ARGV[5]

-- Remove entries older than the window
redis.call("ZREMRANGEBYSCORE", key, "-inf", windowStart)

-- Count the number of requests in the present window
local currentRequests = redis.call("ZCARD", key)

-- If the number of requests is less than the maximum allowed, add the current request
if currentRequests < maxRequests then
    redis.call("ZADD", key, currentTime, uniqueMember)
    redis.call("EXPIRE", key, ttl)
    return 1 -- Allow the request
else
    return 0 -- Deny the request
end
`

export const rateLimiterSlidingWindowLog=asyneHandler(async(req,_,next)=>{
    const clientIP = req.ip || req.connection.remoteAddress;
    if(!clientIP){
        throw new ApiError(400,"Unable to determine client IP address!")
    }
    const redisKey = `rate_limit:${clientIP}`;

    //using redis server time;
    const redisTime = await redis.time();
    const currentTime = parseInt(redisTime[0]) * 1000 + parseInt(redisTime[1]) / 1000;
    const windowStart = currentTime - windowMs;
    const ttl=Math.ceil(windowMs/1000);

    // const currentTime = Date.now();
    // const windowStart = currentTime - windowMs;
    // const ttl=Math.ceil(windowMs/1000);


    const uniqueMember= crypto.randomBytes(16).toString("hex");
    
    const isAllowed=await redis.eval(
        rateLimitScript,
        1,
        redisKey,
        currentTime,
        windowStart,
        maxRequests,
        ttl,
        uniqueMember
    )
    if(Number(isAllowed)===0){
        throw new ApiError(429,"Too many requests, please try again later.")
    }
    next();
});