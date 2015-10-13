'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.inClientViaSocketIO = inClientViaSocketIO;
exports.outClientViaSocketIO = outClientViaSocketIO;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fluxStandardActionJson = require('flux-standard-action-json');

var _fluxStandardActionJson2 = _interopRequireDefault(_fluxStandardActionJson);

var _reduxVia = require('redux-via');

var _constants = require('./constants');

/**
 * @param {Object} socket The Socket.IO socket object.
 * @param {Function} dispatch The dispatch function from store.
 */

function inClientViaSocketIO(socket, dispatch) {
  var inClientViaFn = arguments.length <= 2 || arguments[2] === undefined ? _reduxVia.inClientVia : arguments[2];

  socket.on(_constants.message.action, function (data) {
    var action = _fluxStandardActionJson2['default'].parse(data);
    inClientViaFn(dispatch, action);
  });
}

/**
 * @param {Object} socket The Socket.IO socket object.
 * @returns {Function} A Redux middleware
 */

function outClientViaSocketIO(socket) {
  return (0, _reduxVia.outClientVia)(function (action) {
    var json = _fluxStandardActionJson2['default'].stringify(action);
    socket.emit(_constants.message.action, json);
  });
}