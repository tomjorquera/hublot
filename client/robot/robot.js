// This file is used to define the structure and the behavior of the robot.
//
// It is the first file of the `robot` folder to be loaded in the client.

/* global robot:true robotController robotLib MediaRecorder */
/* exported robot */

const room = arguments[0];
const config = arguments[1];

robotController.external.load(config);

robot = {
  previousReco: [],
  recordedParticipantsWS: {},
  participantsMediaRecorders: {},
  isDisconnected: false,

  processAudio(stream, callback, interval) {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = callback;
    mediaRecorder.start(interval);
    return mediaRecorder;
  },

  processReco(reco) {
    reco = JSON.parse(reco);
    let formattedReco = '';
    const newPreviousReco = [];
    let isRecom = false;

    if (reco.keywords && reco.keywords.length > 0) {
      for (let i = 0; i < reco.keywords.length; i++) {
        if (!isRecom && robot.previousReco.indexOf(reco.keywords[i].key) === -1) {
          isRecom = true;
        }
        newPreviousReco.push(reco.keywords[i].key);
      }
      robot.previousReco = newPreviousReco;

      if (!isRecom) {
        return;
      }

      formattedReco += '<h5>Mots-Clés</h5> ';
      for (let i = 0; i < reco.keywords.length; i++) {
        formattedReco += reco.keywords[i].key + ', ';
      }
      // Remove last ', '
      formattedReco = formattedReco.substring(0, formattedReco.length - 2);
    }

    if (reco.wikiarticles && reco.wikiarticles.length > 0) {
      formattedReco += '<h5>Wikipedia</h5>';
      for (let i = 0; i < reco.wikiarticles.length && i < 5; i++) {
        formattedReco += '<p><a href="' + encodeURI(reco.wikiarticles[i].link) + '" target="_blank">' + reco.wikiarticles[i].title + '</a>';
      }
    }

    if (reco.soArticles && reco.soArticles.length > 0) {
      formattedReco += '<h5>StackOverflow</h5>';
      for (let i = 0; i < reco.soArticles.length && i < 5; i++) {
        formattedReco += '<p><a href="' + encodeURI(reco.soArticles[i].link) + '" target="_blank">' + reco.soArticles[i].title + '</a>';
      }
    }

    console.log(formattedReco);
    if (formattedReco !== '') {
      robotController.sendMessage(config.name, config.avatar, formattedReco);
    }
  },

  openSTTSocket(easyrtcid) {
    const ws = robotLib.stt.getTranscriptSocket(e => {
      console.log('> ' + e.text);
      robotLib.reco.send(
        {
          from: room,
          text: e.from + '\t' + e.until + '\t' + easyrtcid + '\t' + e.text
        });
    });
    ws.onerror = e => {
      // Try to open new connection on error
      console.error('STT ws for ' + easyrtcid + ' error. Trying to reopen');
      console.error(e);
      robot.openSTTSocket(easyrtcid);
    };
    robot.recordedParticipantsWS[easyrtcid] = ws;
  },

  getUserStream(easyrtcid) {
    const stream = robotController.getRemoteStream(easyrtcid);
    robot.participantsMediaRecorders[easyrtcid] = robot.processAudio(stream, e => robot.recordedParticipantsWS[easyrtcid].send(e.data), 100);
  },

  recordParticipant(easyrtcid) {
    robot.openSTTSocket(easyrtcid);
    robot.getUserStream(easyrtcid);
  },

  stopRecordParticipant(easyrtcid) {
    robot.participantsMediaRecorders[easyrtcid].stop();
    robot.recordedParticipantsWS[easyrtcid].close();
  },

  checkDisconnect() {
    if (robotController.getRemoteParticipants().length === 0) {
      robot.stop();
    }
  },

  start: () => {
    robotLib.stt = robotLib.stt(config);
    robotLib.reco = robotLib.reco(config);
    robotLib.archive = robotLib.archive(config);

    robotController.onAttendeePush = (e, data) => {
      robot.recordParticipant(data.easyrtcid);
    };

    robotController.onAttendeeRemove = (e, data) => {
      robot.stopRecordParticipant(data.easyrtcid);
      robot.checkDisconnect();
    };

    function recoStartRetry() {
      if (!robotLib.reco.start(room)) {
        setTimeout(recoStartRetry, 8000);
      }
    }
    // If start fails, schedule retry at fixed interval until success
    recoStartRetry();

    setInterval(
      () => robotLib.reco.getOnlineReco(room)
        .then(robot.processReco)
        .catch(console.error),
      8000);

    // Record current participants already present in the room
    // (except the robot itself)
    for (const participantId of robotController.getRemoteParticipants()) {
      if (participantId !== robotController.getMyId()) {
        robot.recordParticipant(participantId);
      }
    }

    // Wait 5 minute before leaving a room if alone
    setInterval(robot.checkDisconnect, 300000);
  },

  stop: () => {
    robot.isDisconnected = true;
    robotController.disconnect();
  }
};

console.log('robot initialized');
