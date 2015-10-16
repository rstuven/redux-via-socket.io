import fsaJSON from 'flux-standard-action-json';
import {inServerVia, outServerVia} from 'redux-via';
import {message} from './constants';

/**
 * Listens to Socket.IO to handle incoming actions at server side.
 *
 * @param {Object} server The Socket.IO server object.
 * @param {Function} dispatch The dispatch function from store.
 */
export function inServerViaSocketIO(server, dispatch) {
  server.on('connection', socket => {
    socket.on(message.action, data => {
      const action = fsaJSON.parse(data);
      inServerVia(newAction => dispatch(newAction, socket), action, socket.id);
    });
  });
}

/**
 * Builds a middleware that handles outcoming actions at server side.
 *
 * @param {Object} server The Socket.IO server object.
 * @returns {Function} A Redux middleware
 */
export function outServerViaSocketIO(server, filter) {
  return outServerVia((action, broadcast, client) => {
    const json = fsaJSON.stringify(action);

    // See [Send response to all clients except sender](http://stackoverflow.com/a/10099325/149444)
    // and [Get socket by id](http://stackoverflow.com/a/27058015/149444)

    if (broadcast) {
      if (typeof filter === 'function') {
        const {connected} = server.sockets;
        for (const socketId in connected) {
          if (connected.hasOwnProperty(socketId)) {
            const socket = connected[socketId];
            if (filter(action, socket)) {
              server.to(socket.id).emit(message.action, json);
            }
          }
        }
      } else if (typeof client === 'string') {
        // all clients except `client`
        server.sockets.connected[client].broadcast.emit(message.action, json);
      } else {
        // all clients
        server.emit(message.action, json);
      }
    } else if (typeof client === 'string') {
      // just `client`
      server.to(client).emit(message.action, json);
    }
  });
}
