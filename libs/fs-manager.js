const fs = require('fs');
const path = require('path');

class FsManager {
  /**
   * @param {Object} payload
   * @returns {string} File path
   * @description Create a file in filesystem
   */
  static createFile() {
    // TODO
  }

  /**
   * @param {Object} payload
   * @param {string} payload.fileName
   * @param {string} payload.filePath
   * @returns {Object} Object which contains the stream and file path
   * @description Create a file in filesystem and return the stream
   */
  static createFileStream(payload) {
    const { filePath, fileName } = payload;
    const fullPath = path.join(filePath, fileName);

    return {
      fileStream: fs.createWriteStream(fullPath),
      fullPath,
  }

  /**
   * @param {Object} payload
   * @param {string} payload.folderName
   * @param {string} payload.folderPath
   * @returns {string} Folder path
   * @description Create a directory in filesystem
   */
  static createFolder(payload) {
    const { folderPath, folderName } = payload;
    const fullPath = path.join(folderPath, folderName);

    fs.mkdirSync(fullPath, { recursive: true });

    return fullPath;
  }

  /**
   * @param {Object} payload
   * @param {string} payload.fileName
   * @param {string} payload.filePath
   * @description Delete a file from filesystem
   */
  static deleteFile(payload) {
    const { filePath, fileName } = payload;
    const fullPath = path.join(filePath, fileName);

    fs.unlinkSync(fullPath);
  }

  /**
   * @param {Object} payload
   * @param {string} payload.folderName
   * @param {string} payload.folderPath
   * @description Delete a directory from filesystem
   */
  static deleteFolder(payload) {
    const { folderPath, folderName } = payload;
    const fullPath = path.join(folderPath, folderName);

    fs.rmdirSync(fullPath, { recursive: true });
  }

  static moveFile() {
    // TODO
  }

  static moveFolder() {
    // TODO
  }
}

module.exports = FsManager;
