'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.inServerViaSocketIO = inServerViaSocketIO;
exports.outServerViaSocketIO = outServerViaSocketIO;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fluxStandardActionJson = require('flux-standard-action-json');

var _fluxStandardActionJson2 = _interopRequireDefault(_fluxStandardActionJson);

var _reduxVia = require('redux-via');

var _constants = require('./constants');

/**
 * @param {Object} server The Socket.IO server object.
 * @param {Function} dispatch The dispatch function from store.
 */

function inServerViaSocketIO(server, dispatch) {
  server.on('connection', function (socket) {
    socket.on(_constants.message.action, function (data) {
      var action = _fluxStandardActionJson2['default'].parse(data);
      (0, _reduxVia.inServerVia)(dispatch, action, socket.id);
    });
  });
}

/**
 * @param {Object} server The Socket.IO server object.
 * @returns {Function} A Redux middleware
 */

function outServerViaSocketIO(server) {
  return (0, _reduxVia.outServerVia)(function (action, broadcast, client) {
    var json = _fluxStandardActionJson2['default'].stringify(action);

    // See [Send response to all clients except sender](http://stackoverflow.com/a/10099325/149444)
    // and [Get socket by id](http://stackoverflow.com/a/27058015/149444)

    if (typeof client === 'string') {
      if (broadcast) {
        // all clients except `client`
        server.sockets.connected[client].broadcast.emit(_constants.message.action, json);
      } else {
        // just `client`
        server.to(client).emit(_constants.message.action, json);
      }
    } else {
      // all clients
      server.emit(_constants.message.action, json);
    }
  });
}