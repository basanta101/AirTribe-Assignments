// Error-handling middleware
function errorHandler(err, req, res, next) {
    console.error(err.stack);

    // Check if the error has a status code, default to 500 if not set
    const statusCode = err.status || 500;
    
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
}

module.exports = { errorHandler };
