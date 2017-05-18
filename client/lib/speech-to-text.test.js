'use strict';

function WebSocket() {
  return {
    type: 'Websocket'
  };
}

const robotLib = {};

const config = {gstreamerURL: 'ws://testurl'};

describe('client/lib/stt', () => {
  beforeEach(() => {
    global.robotLib = robotLib;
    global.WebSocket = WebSocket;
    /* eslint-disable import/no-unassigned-import */
    require('./speech-to-text.js');
    /* eslint-enable */
  });

  test('should define robotLib.stt', () => {
    expect(global.robotLib.stt).toBeDefined();
  });

  test('should return a Websocket on getTranscriptSocket', () => {
    const stt = global.robotLib.stt(config);
    const res = stt.getTranscriptSocket(() => {});
    expect(res.type).toBe('Websocket');
  });

  test('should call callback on valid segement', () => {
    const stt = global.robotLib.stt(config);
    const callback = jest.fn();
    const ws = stt.getTranscriptSocket(callback);

    const dataContent = {
      status: 0,
      result: {
        final: true,
        hypotheses: [
          {
            transcript: 'this is a transcript'
          }
        ]
      }
    };
    ws.onmessage({
      data: JSON.stringify(dataContent)
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should call callback with actual transcript', () => {
    const stt = global.robotLib.stt(config);
    const callback = jest.fn();
    const ws = stt.getTranscriptSocket(callback);

    const dataContent = {
      status: 0,
      result: {
        final: true,
        hypotheses: [
          {
            transcript: 'this is a transcript'
          }
        ]
      }
    };

    ws.onmessage({
      data: JSON.stringify(dataContent)
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      text: 'this is a transcript'
    }));
  });
  test('should not call callback with incorrect value of status', () => {
    const stt = global.robotLib.stt(config);
    const callback = jest.fn();
    const ws = stt.getTranscriptSocket(callback);

    const dataContent = {
      status: 1,
      result: {
        final: true,
        hypotheses: [
          {
            transcript: 'this is a transcript'
          }
        ]
      }
    };
    ws.onmessage({
      data: JSON.stringify(dataContent)
    });

    expect(callback).not.toHaveBeenCalled();
  });
  test('should not call callback when transcription is not final', () => {
    const stt = global.robotLib.stt(config);
    const callback = jest.fn();
    const ws = stt.getTranscriptSocket(callback);

    const dataContent = {
      status: 0,
      result: {
        final: false,
        hypotheses: [
          {
            transcript: 'this is a transcript'
          }
        ]
      }
    };
    ws.onmessage({
      data: JSON.stringify(dataContent)
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
