// This file is used to define the global `robotController` object that is used
// to expose the hubl.in services as an unified API to be used by the robot.
//
// It is the first file of the `controller` folder to be loaded in the client.

/* global robotController:true document angular easyrtc */
/* exported robotController */

const room = arguments[0];

robotController = {
  $scope: angular.element(document.body).scope().$root,

  chatService: angular.element(document.body).injector().get('chat'),

  getMyId: () => {
    return easyrtc.myEasyrtcid;
  },

  getRemoteStream: participant => {
    return easyrtc.getRemoteStream(participant);
  },

  getParticipants: () => {
    const participants = easyrtc.getRoomOccupantsAsArray(room);
    const res = [];
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      try {
        const mediaStream = robotController.getRemoteStream(participant);
        if (mediaStream !== null) {
          res.push(participant);
        }
      } catch (err) {
        console.error('could not get remote stream for %s', participant);
        console.error(err);
      }
    }
    return res;
  },

  sendMessage: (author, authorAvatar, message) => {
    robotController.chatService.sendMessage({
      author,
      authorAvatar,
      message,
      displayName: author,
      published: new Date()
    });
  },

  getDisconnectButton: () => {
    return document.getElementsByClassName('conference-user-control-bar')[0].childNodes[0].childNodes[2].childNodes[0]; // Check issue #53
  },

  disconnect: () => {
    angular.element(robotController.getDisconnectButton()).scope().leaveConference();
  },

  onAttendeePush: () => {},
  onAttendeeRemove: () => {},
  onAttendeeUpdate: () => {}
};

robotController.$scope.$on('conferencestate:attendees:push', (event, data) => {
  robotController.onAttendeePush(event, data);
});

robotController.$scope.$on('conferencestate:attendees:remove', (event, data) => {
  robotController.onAttendeeRemove(event, data);
});

robotController.$scope.$on('conferencestate:attendees:update', (event, data) => {
  robotController.onAttendeeUpdate(event, data);
});
