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

const sttMock = {
  sttDataSent: [],
  wsMock: {
    status: 'unitialized',
    send(data) {
      sttMock.sttDataSent.push(data);
    },
    close() {
      sttMock.wsMock.status = 'closed';
    }
  },
  getTranscriptSocket: () => {
    sttMock.wsMock.status = 'open';
    sttMock.sttDataSend = [];
    return sttMock.wsMock;
  }
};

describe('client/robot', () => {
  beforeEach(() => {
    global.MediaRecorder = function (stream) {
      const res = {
        type: 'mediaRecorder',
        stream,
        started: false,
        stopped: false,
        interval: null,
        start(interval) {
          this.started = true;
          this.interval = interval;
        },
        stop() {
          this.started = false;
          this.stopped = true;
        }
      };
      global.MediaRecorder.instances[stream.id] = res;
      return res;
    };
    global.MediaRecorder.instances = {};

    global._setIntervalCalls = [];

    global.setInterval = function (f, timeout) {
      global._setIntervalCalls.push([f, timeout]);
    };

    global.isDisconnected = false;
    global.robotController = {
      external: {
        load: () => {}
      },
      getMyId: () => 'robotId',
      getRemoteParticipants: () => [
        'someid0',
        'someid1',
        'someid2'
      ],
      getRemoteStream: id => ({type: 'RemoteStream', id}),
      disconnect: () => {
        global.isDisconnected = true;
      }
    };

    global.robotLib = {
      stt: () => sttMock,
      reco: () => ({
        start: () => {},
        getOnlineReco: () => new Promise(() => {}, () => {})
      }),
      archive: () => ({})
    };

    /* eslint-disable import/no-unassigned-import */
    require('./robot.js');
    /* eslint-enable */
  });

  test('should define global robot variable', () => {
    expect(global.robot).toBeDefined();
  });

  test('should set a interval for disconnection', () => {
    global.robot.start();
    expect.arrayContaining([[global.robot.checkDisconnect, 300000]]);
  });

  test('should return a started mediaRecorder on `processAudio`', () => {
    const res = global.robot.processAudio({
      type: 'stream'
    });
    expect(res.type).toBe('mediaRecorder');
    expect(res.started).toBe(true);
  });

  test('should start the mediaRecorder with correct interval on `processAudio`', () => {
    const res = global.robot.processAudio({
      type: 'stream'
    }, () => {}, 9999);
    expect(res.interval).toBe(9999);
  });

  test('shoud correctly set the callback on `processAudio`', () => {
    let callbackCalled = '';
    const mediaRecorder = global.robot.processAudio({}, e => {
      callbackCalled = e;
    });
    mediaRecorder.ondataavailable('somedata');
    expect(callbackCalled).toBe('somedata');
  });

  test('should not record itself', () => {
    global.robot.start();
    expect(global.MediaRecorder.instances)
      .not.toHaveProperty(global.robotController.getMyId());
  });

  test('should start transcribing users already present on `start`', () => {
    global.robot.start();

    const e1 = {data: 'somedata1'};
    global.MediaRecorder.instances.someid1.ondataavailable(e1);
    expect(sttMock.sttDataSent[0]).toBe(e1.data);

    const e2 = {data: 'somedata2'};
    global.MediaRecorder.instances.someid2.ondataavailable(e2);
    expect(sttMock.sttDataSent[1]).toBe(e2.data);
  });

  test('should start transcribing stream on user connection after `start`', () => {
    global.robot.start();
    global.robotController.onAttendeePush({}, {easyrtcid: 'testid'});

    const e = {data: 'somedata'};
    global.MediaRecorder.instances.testid.ondataavailable(e);
    console.log(sttMock.sttDataSent);
    expect(sttMock.sttDataSent[sttMock.sttDataSent.length - 1]).toBe(e.data);
  });

  test('should stop transcribing stream on user disconnect', () => {
    global.robot.start();
    global.robotController.onAttendeeRemove({}, {easyrtcid: 'someid1'});

    expect(global.MediaRecorder.instances.someid1.stopped).toBeTruthy();
    expect(sttMock.wsMock.status).toBe('closed');
  });

  test('should not disconnected with more than one user', () => {
    global.robot.start();
    global.robotController.onAttendeeRemove({}, {easyrtcid: 'someid1'});

    expect(global.isDisconnected).toBe(false);
  });

  test('should disconnected without user', () => {
    global.robotController.getRemoteParticipants = function () { // Redefine getRemoteParticipants for no user
      return [];
    };

    global.robot.start();
    global.robotController.onAttendeeRemove({}, {easyrtcid: 'someid1'});
    expect(global.isDisconnected).toBe(true);
  });

  test('should try to reopen a stt ws on error', () => {
    global.robot.start();

    // Trigger an error
    sttMock.wsMock.status = 'error';
    sttMock.wsMock.onerror('error');

    // Check WS has been reopened
    expect(sttMock.wsMock.status).toBe('open');
  });
});
