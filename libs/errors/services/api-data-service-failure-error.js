const SingleError = require('../single-error');

module.exports = class ApiDataFailedError extends SingleError {
  constructor(message, errors) {
    // Calling parent constructor of base Error class.
    super(message, errors);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;
    this.statusCode = 500;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
};
