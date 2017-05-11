'use strict';

/* global robotLib:true WebSocket */

robotLib.stt = function (config) {
  return {
    getTranscriptSocket: onSegment => {
      const ws = new WebSocket(config.gstreamerURL + '/client/ws/speech?content-type=audio/x-matroska,,+rate=(int)48000,+channels=(int)1');
      ws.onopen = function () {
        console.info('ws to stt module open');
      };
      ws.onclose = function () {
        console.info('ws to stt module closed');
      };
      ws.onerror = function (event) {
        console.info('ws to stt module error: ' + event);
      };
      ws.onmessage = function (event) {
        const hyp = JSON.parse(event.data);
        if (hyp.status === 0) {
          if (hyp.result !== undefined && hyp.result.final) {
            const trans = ((hyp.result.hypotheses)[0]).transcript;
            let start;
            let end;
            if (hyp['segment-start'] && hyp['segment-length']) {
              start = JSON.parse(hyp['segment-start']);
              end = parseFloat(hyp['segment-start']) + parseFloat(hyp['segment-length']);
            } else {
              const time = new Date().getTime() / 1000;
              start = time;
              end = time + 1;
            }

            onSegment({
              from: start,
              until: end,
              text: trans
            });
          }
        }
      };
      return ws;
    }
  };
};
