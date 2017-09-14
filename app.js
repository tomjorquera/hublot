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
