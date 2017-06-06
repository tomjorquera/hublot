// This file is used to define the structure and the behavior of the robot.
//
// It is the first file of the `robot` folder to be loaded in the client.

/* global robot:true robotController robotLib MediaRecorder */
/* exported robot */

const room = arguments[0];
const config = arguments[1];

robotController.external.load(config);

robot = {
  recordedParticipants: {},

  processAudio(stream, callback, interval) {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = callback;
    mediaRecorder.start(interval);
    return mediaRecorder;
  },

  processReco(reco) {
    reco = JSON.parse(reco);
    let formattedReco = '';

    if (reco.keywords && reco.keywords.length > 0) {
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

  recordParticipant(easyrtcid) {
    const stream = robotController.getRemoteStream(easyrtcid);
    const ws = robotLib.stt.getTranscriptSocket(e => {
      console.log('> ' + e.text);
      robotLib.reco.send(
        {
          from: room,
          text: e.from + '\t' + e.until + '\t' + easyrtcid + '\t' + e.text
        });
    });
    robot.processAudio(stream, e => ws.send(e.data), 100);
    robot.recordedParticipants[easyrtcid] = ws;
  },

  start: () => {
    robotLib.stt = robotLib.stt(config);
    robotLib.reco = robotLib.reco(config);
    robotLib.archive = robotLib.archive(config);

    robotController.onAttendeePush = (e, data) => {
      robot.recordParticipant(data.easyrtcid);
    };

    robotLib.reco.start(room);
    setInterval(
      () => robotLib.reco.getOnlineReco(room)
        .then(robot.processReco)
        .catch(console.error),
      8000);

    // Record current participants already present in the room
    robotController.getParticipants().map(robot.recordParticipant);
  }
};
