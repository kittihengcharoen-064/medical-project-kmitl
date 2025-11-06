class HttpException extends Error {
  constructor(statusCode = 500, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = HttpException