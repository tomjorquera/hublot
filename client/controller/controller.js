// This file is used to define the global `robotController` object that is used
// to expose the hubl.in services as an unified API to be used by the robot.
//
// It is the first file of the `controller` folder to be loaded in the client.

/* global robotController:true document angular easyrtc */
/* exported robotController */

const room = arguments[0];
const name = arguments[1];

robotController = {
  $scope: angular.element(document.body).scope().$root,

  chatService: angular.element(document.body).injector().get('chat'),

  getParticipants: () => {
    return easyrtc.getRoomOccupantsAsArray(room);
  },

  getRemoteStream: participant => {
    return easyrtc.getRemoteStream(participant);
  },

  getRemoteStreams: () => {
    const participants = robotController.getParticipants();
    const res = {};
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      try {
        const mediaStream = robotController.getRemoteStream(participant);
        if (mediaStream !== null) {
          res[participant] = mediaStream;
        }
      } catch (err) {
        console.error('could not get remote stream for %s', participant);
        console.error(err);
      }
    }
    return res;
  }
};

robotController.$scope.$on('conferencestate:attendees:push', (event, data) => {
  console.log('### someone connected %j %j', event, data);
  console.log('RemoteMediaStream %j', robotController.getRemoteStream(data.easyrtcid));
  robotController.chatService.sendMessage({author: name, displayName: name, message: 'Hello!'});
});

robotController.$scope.$on('conferencestate:attendees:remove', (event, data) => {
  console.log('### someone leaved %j %j', event, data);
  robotController.chatService.sendMessage({author: name, displayName: name, message: 'Goodbye!'});
});

robotController.$scope.$on('attendee:update', (event, data) => {
  console.log('### received update %j %j', event, data);
});
