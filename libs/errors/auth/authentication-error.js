const SingleError = require('../single-error');

module.exports = class AuthenticationError extends SingleError {
  constructor() {
    const details = {
      path: 'authentication',
    };
    // Calling parent constructor of base Error class.
    super('Invalid credentials', 'authentication-failed', details);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;
    this.statusCode = 401;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
};
