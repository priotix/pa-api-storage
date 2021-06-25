const Busboy = require('busboy');

class MultipartStream {
  static async single(ctx, next) {
    ctx.filemeta = await new Promise((resolve, reject) => {
      function onFile(fieldname, file, filename) {
        resolve({ file, filename });
      }

      function onError(err) {
        reject(err);
      }
      const busboy = new Busboy({
        headers: ctx.req.headers,
        limits: {
          files: 1,
        },
      });

      busboy.on('file', onFile);
      busboy.on('error', onError);

      ctx.req.pipe(busboy);
    });

    return next();
  }
}

module.exports = MultipartStream;
