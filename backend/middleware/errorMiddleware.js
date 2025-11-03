// This function runs when a route is not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// This function is our main error handler
const errorHandler = (err, req, res, next) => {
  // Sometimes an error might come with a 200 status code, this will fix it
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // We only want the stack trace if we are not in 'production'
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
