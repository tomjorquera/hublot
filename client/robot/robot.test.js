'use strict';

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

    global.robotController = {
      external: {
        load: () => {}
      },
      getParticipants: () => ['someid1', 'someid2'],
      getRemoteStream: id => ({type: 'RemoteStream', id})
    };

    global.robotLib = {
      sttDataSent: [],
      closed: false,
      stt: () => ({
        getTranscriptSocket: () => ({
          send(data) {
            global.robotLib.sttDataSent.push(data);
          },
          close() {
            global.robotLib.closed = true;
          }
        })
      }),
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

  test('should start transcribing users already present on `start`', () => {
    global.robot.start();

    const e1 = {data: 'somedata1'};
    global.MediaRecorder.instances.someid1.ondataavailable(e1);
    expect(global.robotLib.sttDataSent[0]).toBe(e1.data);

    const e2 = {data: 'somedata2'};
    global.MediaRecorder.instances.someid2.ondataavailable(e2);
    expect(global.robotLib.sttDataSent[1]).toBe(e2.data);
  });

  test('should start transcribing stream on user connection after `start`', () => {
    global.robot.start();
    global.robotController.onAttendeePush({}, {easyrtcid: 'testid'});

    const e = {data: 'somedata'};
    global.MediaRecorder.instances.testid.ondataavailable(e);
    expect(global.robotLib.sttDataSent[0]).toBe(e.data);
  });

  test('should stop transcribing stream on user disconnect', () => {
    global.robot.start();
    global.robotController.onAttendeeRemove({}, {easyrtcid: 'someid1'});

    expect(global.MediaRecorder.instances.someid1.stopped).toBeTruthy();
    expect(global.robotLib.closed).toBeTruthy();
  });
});
