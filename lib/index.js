'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _client = require('./client');

var _server = require('./server');

exports['default'] = {
  inClientViaSocketIO: _client.inClientViaSocketIO,
  outClientViaSocketIO: _client.outClientViaSocketIO,
  inServerViaSocketIO: _server.inServerViaSocketIO,
  outServerViaSocketIO: _server.outServerViaSocketIO
};
module.exports = exports['default'];