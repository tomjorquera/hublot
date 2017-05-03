let webdriverio = require('webdriverio');

module.exports = (config) => ({

  run: (controller, server, room) => {
    let client = webdriverio.remote(config.driver);
    client.init()
      .url(server + '/' + room)
      .execute(controller, room, config.name) // injecting our controller
      .waitForVisible('#displayname', 30000)
      .setValue('#displayname', config.name)
      .click('.btn')
      .waitForExist('//div[@video-id="video-thumb8"]', 30000);
    return client;
  }
});
