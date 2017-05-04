'use strict';

const fs = require('mz/fs');

module.exports = root => {

  const controller = {
    load: (module) => new Promise((resolve, reject) => {

      // first we read the file with the same name than the folder
      fs.readFile(root + '/' + module + '/' + module + '.js', 'utf8')
        .then(content => {

          // then we read all the other files in the folder
          fs.readdir(root + '/' + module)
            .then(files => {

              // remove the file we already read
              files.splice(files.indexOf(module + '.js'), 1);

              Promise.all(files.map(
                f => fs.readFile(root + '/' + module + '/' + f, 'utf8')
              ))
                .then(contents => {
                  // concatenate all the files and resolve
                  resolve([content].concat(contents));
                })
                .catch(err => { reject(err); });

            })
            .catch(err => { reject(err); });

        })
        .catch(err => { reject(err); });

    }),

    loadAll: (...modules) => new Promise((resolve, reject) => {

      // load all the passed modules
      Promise.all(
        modules.map(f => controller.load(f)))
        .then(values => {

          // concatenate all the arrays into a single one
          resolve(Array.prototype.concat.apply([], values));

        }).catch(err => {
          reject(err);
        });

    })
  };

  return controller;
};
