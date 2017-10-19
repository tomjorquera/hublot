/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Hublot
 * (see https://ci.linagora.com/linagora/lgs/labs/hublot).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const webdriverio = require('webdriverio');

// Utility function to resolve a list of promise-based function calls
// on a given element list sequentially
function resolveSequentially(f, elements) {
  return elements.reduce(
    (acc, curr) => acc.then(() => f(curr)).catch(err => console.error(err)),
    new Promise(resolve => resolve()));
}

module.exports = config => ({
  run: (controllerFilesList, server, room, clientConfig) => {
    console.log('runner is up');
    const client = webdriverio.remote(config.driver);
    console.log('runner created client');
    return client.init()
      .then(() => console.log('runner: client started'))
      .url(server + '/' + room)
      .then(() => console.log('runner: connecting to url'))
      .waitForVisible('#displayname', 30000)
      .then(() => console.log('runner: displayname visible'))
      .then(() => resolveSequentially(f => client.execute(f, room, clientConfig),
                                      controllerFilesList))
      .then(() => console.log('runner: modules resolved'))
      .then(() => client.execute(() => {
        setTimeout(() => {
          /* eslint-disable no-undef */
          robot.start();
          /* eslint-enable */
        }, 500);
      }))
      .then(() => console.log('runner: robot started'))
      .setValue('#displayname', clientConfig.name)
      .click('.btn')
      .then(() => console.log('runner: button clicked'))
      .waitForExist('//div[@video-id="video-thumb8"]', 30000)
      .then(() => console.log('runner: video exists'))
      .catch(err => console.log('runner: error %j', err));
  }
});
