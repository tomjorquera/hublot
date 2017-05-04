const room = arguments[0];
const name = arguments[1];

robotController = {
  $scope: angular.element(document.body).scope().$root,

  chatService: angular.element(document.body).injector().get('chat'),

  getParticipants: () => {
    return easyrtc.getRoomOccupantsAsArray(room);
  },

  getRemoteStream: (participant) => {
    return easyrtc.getRemoteStream(participant);
  },

  getRemoteStreams: () => {
    let participants = robotController.getParticipants();
    let res = {};
    for(let i = 0; i < participants.length; i++){
      let participant = participants[i];
      try{
        let mediaStream = robotController.getRemoteStream(participant);
        if(mediaStream !== null){
          res[participant] = mediaStream;
        }
      } catch (e){
        console.error('could not get remote stream for %s', participant);
        console.error(e);
      }
    }
    return res;
  }
};

robotController.$scope.$on('conferencestate:attendees:push', function(event, data) {
  console.log('### someone connected %j %j', event, data);
  console.log('RemoteMediaStream %j', robotController.getRemoteStream(data.easyrtcid));
  robotController.chatService.sendMessage({author: name, displayName: name, message: 'Hello!'});
});

robotController.$scope.$on('conferencestate:attendees:remove', function(event, data) {
  console.log('### someone leaved %j %j', event, data);
  robotController.chatService.sendMessage({author: name, displayName: name, message: 'Goodbye!'});
});

robotController.$scope.$on('attendee:update', function(event, data){
  console.log('### received update %j %j', event, data);
});
