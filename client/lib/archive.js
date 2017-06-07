'use strict';

/* global robotLib:true XMLHttpRequest */

robotLib.archive = function (config) {
  return {
    store(transcript) {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', config.archive + '/json-handler');
      xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xmlhttp.send(JSON.stringify(transcript));
    }
  };
};
