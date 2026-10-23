const errorHandler = (err,req,res,next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message =
        err.statusCode
            ? err.message
            : "Internal Server Error";

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false
    });
};
export { errorHandler };