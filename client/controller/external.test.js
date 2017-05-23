'use strict';

/* global Object document */

Object.defineProperty(document, 'appendedElements', {
  value: []
});

Object.defineProperty(document, 'createElement', {
  value: type => {
    const res = {
      type,
      setAttribute: (k, v) => {
        res[k] = v;
      }
    };
    return res;
  }
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: e => {
      document.appendedElements.push(e);
    }
  }
});

describe('client/controller/external', () => {
  beforeEach(() => {
    global.robotController = {};

    /* eslint-disable import/no-unassigned-import */
    require('./external.js');
    /* eslint-enable */
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should add itself to controller', () => {
    expect(global.robotController.external).toBeDefined();
  });

  test('should load external libs in config', () => {
    global.robotController.external.load({
      externalLibs: ['dep1', 'dep2', 'dep3']
    });
    console.log(document);
    expect(document.appendedElements).toHaveLength(3);
    expect(document.appendedElements[0]).toEqual(expect.objectContaining({
      type: 'text/javascript',
      src: 'dep1'
    }));
    expect(document.appendedElements[1]).toEqual(expect.objectContaining({
      type: 'text/javascript',
      src: 'dep2'
    }));
    expect(document.appendedElements[2]).toEqual(expect.objectContaining({
      type: 'text/javascript',
      src: 'dep3'
    }));
  });
});
