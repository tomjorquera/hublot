const webdriverio = require('webdriverio');

module.exports = config => ({
  run: (controllerFilesList, server, room, clientConfig) => {
    const client = webdriverio.remote(config.driver);
    return client.init()
      .url(server + '/' + room)
      .then(
        () => Promise.all(controllerFilesList.map(
          f => client.execute(f, room, clientConfig))))
      .then(() => client.execute(() => {
        /* eslint-disable no-undef */
        robot.start();
        /* eslint-enable */
      }))
      .waitForVisible('#displayname', 30000)
      .setValue('#displayname', clientConfig.name)
      .click('.btn')
      .waitForExist('//div[@video-id="video-thumb8"]', 30000);
  }
});
