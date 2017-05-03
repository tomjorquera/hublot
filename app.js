const config = require('./config.json');

const webdriverio = require('webdriverio');
const fs = require('fs');

const runner = require('./lib/runner.js')(config.runner);

fs.readFile('robotClientController.js', 'utf8', (err,data) => {
  if (err) {
    console.error(err);
    return;
  }
  let client = runner.run(data, config.visio.url, 'test-bot');
});
