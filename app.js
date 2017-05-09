const config = require('./config.json');

const runner = require('./lib/runner.js')(config.runner);
const controller = require('./lib/controller.js')('./client');

controller.loadAll('controller', 'lib', 'robot')
  .then(modules => {
    let client = runner.run(modules, config.visio.url, 'test-bot');
  })
  .catch(err => {
    console.error(err);
    return;
  });
