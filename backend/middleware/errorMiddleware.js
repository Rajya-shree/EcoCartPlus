// // This function runs when a route is not found
// const notFound = (req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// };

// // This function is our main error handler
// const errorHandler = (err, req, res, next) => {
//   // Sometimes an error might come with a 200 status code, this will fix it
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//   res.status(statusCode);
//   res.json({
//     message: err.message,
//     // We only want the stack trace if we are not in 'production'
//     stack: process.env.NODE_ENV === "production" ? null : err.stack,
//   });
// };

// module.exports = { notFound, errorHandler };

// // Add this at the very bottom of your backend/index.js (after all routes)
// app.use((err, req, res, next) => {
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//   console.error("❌ SERVER ERROR:", err.message);
//   console.error(err.stack); // This prints exactly which line failed in your terminal

//   res.status(statusCode).json({
//     message: err.message,
//     stack: process.env.NODE_ENV === "production" ? null : err.stack,
//   });
// });

// backend/middleware/errorMiddleware.js

// 1. Function to handle 404 Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 2. Main function to handle all server errors (500s)
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error to the terminal so YOU can see it
  console.error("❌ SERVER ERROR:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// 3. Export them so index.js can use them
module.exports = { notFound, errorHandler };
