const SingleError = require('./single-error');

module.exports = class PayloadToLarge extends SingleError {
  constructor(size) {
    const details = {
      size,
    };

    // Calling parent constructor of base Error class.
    super('Not enough user space', 'payload-too-large', details);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;
    this.statusCode = 413;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
};
