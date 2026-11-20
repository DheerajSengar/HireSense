const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'Resume files must be 5 MB or smaller.', statusCode: 400 };
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { message: 'Upload a single PDF using the resume field.', statusCode: 400 };
  }

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  if (err.code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  if (err.isOperational) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
