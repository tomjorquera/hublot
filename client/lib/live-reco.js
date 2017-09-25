'use strict';

/* global robotLib:true Stomp SockJS XMLHttpRequest */

robotLib.reco = function (config) {
  let recoStompClient;
  let connected = false;

  function tryConnect() {
    recoStompClient = Stomp.over(new SockJS('http://' + config.reco.host + ':' + config.reco.port + '/chat'));
    recoStompClient.connect(
      {},
      () => {
        connected = true;
      },
      err => {
        connected = false;

        console.error('Online reco: STOMP failed to connect to %s:%s (trying again in %d ms)',
                      config.reco.host, config.reco.port, config.reco.reconnectInterval);
        console.error('Online reco: ' + err);
        setTimeout(tryConnect, config.reco.reconnectInterval);
      });
  }

  tryConnect();

  return {
    start: confid => {
      if (!connected) {
        console.error('Online reco: not connected but trying to send start to conf %s', confid);
        return false;
      }
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', 'http://' + config.reco.host + ':' + config.reco.port + '/stream?action=START&id=' + confid, false);
      xhttp.send();
      return true;
    },

    stop: confid => {
      if (!connected) {
        console.error('Online reco: not connected but trying to send stop to conf %s', confid);
        return false;
      }
      const xhttp = new XMLHttpRequest();
      xhttp.open('GET', 'http://' + config.reco.host + ':' + config.reco.port + '/stream?action=STOP&id=' + confid, false);
      xhttp.send();
      return true;
    },

    send: content => {
      if (!connected) {
        console.error('Online reco: not connected but trying to send %j', content);
        return false;
      }
      recoStompClient.send('/app/chat', {}, JSON.stringify(content));
      return true;
    },

    getOnlineReco: confId => {
      return new Promise((resolve, reject) => {
        const xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
          if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
              resolve(xmlHttp.responseText);
            } else {
              console.error('Online reco: error trying to reach http://%s:%s/resources', config.reco.host, config.reco.port);
              reject(xmlHttp.statusText);
            }
          }
        };

        const url = 'http://' + config.reco.host + ':' + config.reco.port + '/resources?id=' + confId + '&resources=keywords;wiki';
        xmlHttp.open('GET', url, true);
        xmlHttp.setRequestHeader('Content-type', 'application/json');
        xmlHttp.send(null);
      });
    }
  };
};
