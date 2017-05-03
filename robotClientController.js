var room = arguments[0];
var name = arguments[1];

controller = {
  $scope: angular.element(document.body).scope().$root,

  chatService: angular.element(document.body).injector().get('chat'),

  getParticipants: () => {
    return easyrtc.getRoomOccupantsAsArray(room);
  },

  getRemoteStream: (participant) => {
    return easyrtc.getRemoteStream(participant);
  },

  getRemoteStreams: () => {
    let participants = controller.getParticipants();
    let res = {};
    for(let i = 0; i < participants.length; i++){
      let participant = participants[i];
      try{
        let mediaStream = controller.getRemoteStream(participant);
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

controller.$scope.$on('conferencestate:attendees:push', function(event, data) {
  console.log('### someone connected %j %j', event, data);
  console.log('RemoteMediaStream %j', controller.getRemoteStream(data.easyrtcid));
  controller.chatService.sendMessage({author: name, displayName: name, message: 'Hello!'});
});

controller.$scope.$on('conferencestate:attendees:remove', function(event, data) {
  console.log('### someone leaved %j %j', event, data);
  controller.chatService.sendMessage({author: name, displayName: name, message: 'Goodbye!'});
});

controller.$scope.$on('attendee:update', function(event, data){
  console.log('### received update %j %j', event, data);
});
