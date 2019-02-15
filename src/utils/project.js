const fs = require('fs');
const path = require('path');
const os = require('os');

const filesystemRoot =
  os.platform() === 'win32'
    ? process
        .cwd()
        .split(path.sep)[0]
        .toLowerCase() + path.sep
    : '/';

const _lookForRootSync = (aPath, callback) => {
  const fullPath = path.join(aPath, 'trapezo.json');

  const _lookInParentFolder = () => {
    if (aPath === filesystemRoot) {
      // eslint-disable-next-line
      throw '[dependency injector] No trapezo.json found - reached filesystem root.';
    } else {
      aPath = path.join(aPath, '..');
      _lookForRootSync(aPath, callback);
    }
  };

  try {
    // For a reason that escapes me, fs.stat (async method) fails in Mocha.
    const stats = fs.statSync(fullPath);
    if (stats.isFile()) {
      try {
        const data = fs.readFileSync(fullPath, 'utf8');
        const obj = JSON.parse(data);
        if (obj.hasOwnProperty('root')) {
          // Found the root config file!
          if (obj.root) {
            return callback(null, aPath, obj);
          }
          _lookInParentFolder();
        }
      } catch (err) {
        throw err;
      }
    } else {
      _lookInParentFolder();
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      _lookInParentFolder();
    } else {
      // Other error, throw
      return callback(err, null);
    }
  }
};

const lookForRoot = aPath => {
  return new Promise((resolve, reject) => {
    try {
      _lookForRootSync(aPath, (err, aPath, diConfig) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rootDir: aPath, config: diConfig });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { lookForRoot };
