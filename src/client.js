import fsaJSON from 'flux-standard-action-json';
import {inClientVia, outClientVia} from 'redux-via';
import {message} from './constants';

/**
 * Handles incoming actions at client side.
 *
 * @param {Object} socket The Socket.IO socket object.
 * @param {Function} dispatch The dispatch function from store.
 */
export function inClientViaSocketIO(socket, dispatch, inClientViaFn = inClientVia) {
  socket.on(message.action, data => {
    const action = fsaJSON.parse(data);
    inClientViaFn(dispatch, action);
  });
}

/**
 * Builds a middleware that handles outcoming actions at client side.
 *
 * @param {Object} socket The Socket.IO socket object.
 * @returns {Function} A Redux middleware
 */
export function outClientViaSocketIO(socket) {
  return outClientVia((action) => {
    const json = fsaJSON.stringify(action);
    socket.emit(message.action, json);
  });
}
