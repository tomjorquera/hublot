'use strict';

/**
 * This file defines a mock for the mz/fs lib.
 *
 * It allows us to mock filesystem access during tests.
 *
 * To use it, call the `__setup` method before your tests and pass it a
 * dictionary of { "filepath": "content"} that represent the filesystem to mock.
 *
 */

const path = require('path');

const fs = jest.genMockFromModule('mz/fs');

let mockFiles = Object.create(null);

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `moz/fs` APIs are used.
fs.__setup = function(newMockFiles){
  mockFiles = newMockFiles;
}


fs.readFile = function(filePath, ...rest) {
  if(Object.keys(mockFiles).includes(filePath)){
    return Promise.resolve(mockFiles[filePath]);
  } else {
    return Promise.reject(new Error('no such file or directory'));
  }
};

fs.readdir = function(dirPath, ...rest) {
  const res = Object.keys(mockFiles)
        .filter(f => path.dirname(f) == dirPath)
        .map(f => path.basename(f));
  if(res.length != 0) {
    return Promise.resolve(res);
  } else {
    return Promise.reject(new Error('no such file or directory')) ;
  }
};

module.exports = fs;
