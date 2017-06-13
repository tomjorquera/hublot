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
    const client = webdriverio.remote(config.driver);
    return client.init()
      .url(server + '/' + room)
      .then(() => resolveSequentially(f => client.execute(f, room, clientConfig),
                                      controllerFilesList))
      .then(() => client.execute(() => {
        setTimeout(() => {
          /* eslint-disable no-undef */
          robot.start();
          /* eslint-enable */
        }, 500);
      }))
      .waitForVisible('#displayname', 30000)
      .setValue('#displayname', clientConfig.name)
      .click('.btn')
      .waitForExist('//div[@video-id="video-thumb8"]', 30000);
  }
});
