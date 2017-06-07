'use strict';

describe('client/lib/stt', () => {
  beforeEach(() => {
    global.robotLib = {};

    /* eslint-disable import/no-unassigned-import */
    require('./archive.js');
    /* eslint-enable */
  });

  test('should define robotLib.archive', () => {
    expect(global.robotLib.archive).toBeDefined();
  });
});
