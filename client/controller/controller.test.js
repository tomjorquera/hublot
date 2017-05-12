'use strict';

// Let's do some simple mocking of client-side services

const angular = {
  registeredEvents: {},
  element: () => ({
    scope: () => ({
      $root: {
        $on: (event, f) => {
          angular.registeredEvents[event] = f;
        }
      }
    }),
    injector: () => ({
      get: () => {
        return {};
      }
    })
  })
};

const easyRTCMock = participants => ({
  getRoomOccupantsAsArray: () => participants,
  getRemoteStream: participant => ({origin: participant})
});

const document = {
  body: {}
};

describe('client/controller', () => {
  beforeEach(() => {
    global.document = document;
    global.angular = angular;
    global.easyrtc = easyRTCMock(['p1', 'p2', 'p3']);

    /* eslint-disable import/no-unassigned-import */
    require('./controller.js');
    /* eslint-enable */
  });

  test('should set robotController global', () => {
    expect(global.robotController).toBeDefined();
  });

  test('should return the correct participants', () => {
    const participants = global.robotController.getParticipants();
    expect(participants).toEqual(expect.arrayContaining(['p1', 'p2', 'p3']));
    expect(participants).toHaveLength(3);
  });

  test('should return the Streams of the participant', () => {
    const stream = global.robotController.getRemoteStream('p2');
    expect(stream.origin).toBe('p2');
  });

  test('should return the Streams of all the participants', () => {
    const streams = global.robotController.getRemoteStreams();
    expect(streams).toHaveProperty('p1');
    expect(streams).toHaveProperty('p2');
    expect(streams).toHaveProperty('p3');
  });

  test('should call listener on push events', () => {
    let eventFired = false;

    global.robotController.onAttendeePush = () => {
      eventFired = true;
    };

    expect(angular.registeredEvents).toHaveProperty('conferencestate:attendees:push');
    expect(eventFired).toBe(false);

    angular.registeredEvents['conferencestate:attendees:push']({});

    expect(eventFired).toBe(true);
  });

  test('should call listener on remove events', () => {
    let eventFired = false;

    global.robotController.onAttendeeRemove = () => {
      eventFired = true;
    };

    expect(angular.registeredEvents).toHaveProperty('conferencestate:attendees:remove');
    expect(eventFired).toBe(false);

    angular.registeredEvents['conferencestate:attendees:remove']({});

    expect(eventFired).toBe(true);
  });

  test('should call listener on update events', () => {
    let eventFired = false;

    global.robotController.onAttendeeUpdate = () => {
      eventFired = true;
    };

    expect(angular.registeredEvents).toHaveProperty('conferencestate:attendees:update');
    expect(eventFired).toBe(false);

    angular.registeredEvents['conferencestate:attendees:update']({});

    expect(eventFired).toBe(true);
  });
});
