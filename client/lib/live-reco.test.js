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

'use strict';

const robotLib = {};

function SockJS() {
  return {
    type: 'Sock'
  };
}

const StompclientMock = {
  connect: (f1, f2) => {
    f2();
  },
  send: jest.fn().mockImplementation(() => ({}))
};

const StompMock = {
  over: () => StompclientMock
};

const XMLHttpRequestMock = {
  open: jest.fn().mockImplementation(() => ({})),
  setRequestHeader: () => {},
  send: jest.fn().mockImplementation(() => {
    XMLHttpRequestMock.readyState = 4;
    XMLHttpRequestMock.status = 200;
    XMLHttpRequestMock.responseText = 'somedata';
    XMLHttpRequestMock.onreadystatechange();
    return {};
  }),
  onreadystatechange: () => {}
};

const XMLHttpRequest = function () {
  // Reset mock
  XMLHttpRequestMock.readyState = 0;
  XMLHttpRequestMock.status = 0;
  XMLHttpRequestMock.responseText = '';
  XMLHttpRequestMock.onreadystatechange = () => {};
  return XMLHttpRequestMock;
};

const config = {
  reco: {
    host: 'localhost',
    port: 8080,
    reconnectInterval: 1000
  }
};

describe('client/lib/reco', () => {
  beforeEach(() => {
    global.robotLib = robotLib;
    global.Stomp = StompMock;
    global.SockJS = SockJS;
    global.XMLHttpRequest = XMLHttpRequest;

    /* eslint-disable import/no-unassigned-import */
    require('./live-reco.js');
    /* eslint-enable */
  });
  global.robotReco = {
    getRecommendation: id => ({type: 'Recommendation', id})
  };

  test('should define robotLib.reco', () => {
    expect(global.robotLib.reco).toBeDefined();
  });

  test('should make correct REST call on start', () => {
    const confId = 'testConf';
    const urlExpected = 'http://localhost:8080/stream?action=START&id=' + confId;

    const reco = global.robotLib.reco(config);
    reco.start(confId);
    expect(XMLHttpRequestMock.open).toHaveBeenCalledWith('GET', urlExpected, expect.anything());
    expect(XMLHttpRequestMock.send).toHaveBeenCalled();
  });

  test('should make correct REST call on stop', () => {
    const confId = 'testConf';
    const urlExpected = 'http://localhost:8080/stream?action=STOP&id=' + confId;

    const reco = global.robotLib.reco(config);
    reco.stop(confId);
    expect(XMLHttpRequestMock.open).toHaveBeenCalledWith('GET', urlExpected, expect.anything());
    expect(XMLHttpRequestMock.send).toHaveBeenCalled();
  });

  test('should make correct STOMP call when sending data', () => {
    const content = {
      data: 'testData'
    };
    const reco = global.robotLib.reco(config);
    reco.send(content);
    expect(StompclientMock.send).toHaveBeenCalledWith('/app/chat', {}, JSON.stringify(content));
  });

  test('should make correct REST call when getting recommendation', done => {
    const reco = global.robotLib.reco(config);
    reco.getOnlineReco('testconf')
      .then(res => {
        expect(res).toBe('somedata');
        done();
      });
  });
});
