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

const config = require('./config.json');

const runner = require('./lib/runner.js')(config.runner);
const controller = require('./lib/controller.js')('./client');

console.log('starting hublot...');

controller.loadAll('controller', 'lib', 'robot')
  .then(modules => {
    console.log('modules loaded... launching runner');
    // Note: result can be stored in a variable to control further the browser
    // e.g.: let client =  runner.run(...); client.end();
    runner.run(modules, config.visio.url, 'test-bot', config.client);
  })
  .catch(err => {
    console.error(err);
  });

// Hang
(function wait() {
  setTimeout(wait, 10000);
})();
