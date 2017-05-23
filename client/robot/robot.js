// This file is used to define the structure and the behavior of the robot.
//
// It is the first file of the `robot` folder to be loaded in the client.

/* global robot:true robotController robotLib MediaRecorder */
/* exported robot */

const config = arguments[1];

robot = {
  recordedParticipants: {},

  processAudio(stream, callback, interval) {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = callback;
    mediaRecorder.start(interval);
    return mediaRecorder;
  },
  start: () => {
    robotController.external.load(config);
    robotLib.stt = robotLib.stt(config);

    robotController.onAttendeePush = (e, data) => {
      const stream = robotController.getRemoteStream(data.easyrtcid);
      const ws = robotLib.stt.getTranscriptSocket(e => console.log('> ' + e.text));
      robot.processAudio(stream, e => ws.send(e.data), 100);
    };
  }
};
