'use strict';

jest.mock('mz/fs');

describe('loadModules', () => {
  const MOCK_FILES = {
    '/test/controller/controller.js': '1',
    '/test/controller/controller.test.js': 'sometest',
    '/test/controller/file.js': '2',
    '/test/controller/file.test.js': 'sometest',
    '/test/lib/lib.js': '3',
    '/test/robot/robot.js': '4',
    '/test/notavalidmodule/file.js': '5'
  };

  beforeEach(() => {
    require('mz/fs').__setup(MOCK_FILES);
  });

  describe('loading a module', () => {
    test('should include all (and only) non-test files in its dir.', done => {
      const controller = require('./controller.js')('/test');

      controller.load('controller')
        .then(res => {
          expect(res.length).toBe(2);
          expect(res.includes('1')).toBeTruthy();
          expect(res.includes('2')).toBeTruthy();
          done();
        });
    });

    test('should return the files in the correct order', done => {
      const controller = require('./controller.js')('/test');

      controller.load('controller')
        .then(res => {
          expect(res[0]).toBe('1');
          expect(res[1]).toBe('2');
          done();
        });
    });

    test('should fail for a nonexistent module', done => {
      const controller = require('./controller.js')('/test');

      controller.load('nonexistent')
        .catch(() => done());
    });

    test('should fail for a module missing its base file', done => {
      const controller = require('./controller.js')('/test');

      controller.load('notavalidmodule')
        .catch(() => done());
    });
  });

  describe('loading several modules', () => {
    test('should include all files from all modules', done => {
      const controller = require('./controller.js')('/test');

      controller.loadAll('controller', 'lib', 'robot')
        .then(res => {
          expect(res.length).toBe(4);
          expect(res.includes('1')).toBeTruthy();
          expect(res.includes('2')).toBeTruthy();
          expect(res.includes('3')).toBeTruthy();
          expect(res.includes('4')).toBeTruthy();
          done();
        });
    });

    test('should return files in correct order', done => {
      const controller = require('./controller.js')('/test');

      controller.loadAll('controller', 'lib', 'robot')
        .then(res => {
          expect(res[0]).toBe('1');
          expect(res[1]).toBe('2');
          expect(res[2]).toBe('3');
          expect(res[3]).toBe('4');
          done();
        });
    });

    test('should fail when trying to load a non-existent module ', done => {
      const controller = require('./controller.js')('/test');
      controller.loadAll('controller', 'lib', 'robot', 'nonexistent')
        .catch(() => done());
    });

    test('should fail when trying to load an invalid module', done => {
      const controller = require('./controller.js')('/test');
      controller.loadAll('controller', 'lib', 'robot', 'invalid')
        .catch(() => done());
    });
  });
});
