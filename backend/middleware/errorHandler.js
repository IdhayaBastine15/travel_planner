function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;
