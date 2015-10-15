import sinon from 'sinon';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {inServerViaSocketIO} from '..';
import {message} from '../src/constants';

describe('inServerViaSocketIO', () => {

  const type = 'ACTION';
  const client = '12345';

  let server;
  let socket;
  let dispatch;

  beforeEach(() => {
    server = new EventEmitter();
    socket = new EventEmitter();
    socket.id = client;
    dispatch = sinon.spy();
    inServerViaSocketIO(server, dispatch);
    server.emit('connection', socket);
  });

  it('should throw error', () => {
    const data = `{}`;
    expect(() => {
      socket.emit(message.action, data);
    }).throw('Argument is not a Flux Standard Action');
    expect(dispatch).to.not.be.called;
  });

  it('should set the client identifier before dispatch', () => {
    const data = `{"type":"${type}"}`;
    socket.emit(message.action, data);
    const action = {type, meta: {client}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should remove server before dispatch', () => {
    const data = `{"type":"${type}","meta":{"server":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {client}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should not remove broadcast before dispatch', () => {
    const data = `{"type":"${type}","meta":{"broadcast":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {client, broadcast: true}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should remove next before dispatch', () => {
    const data = `{"type":"${type}","meta":{"next":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {client}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should allow to tweak the action with socket metadata before dispatch', () => {
    const _server = new EventEmitter();
    const _socket = new EventEmitter();
    _socket.id = client;
    _socket.request = {user: {name: 'admin'}}; // using something like passport.socketio
    const _dispatch = sinon.spy();
    inServerViaSocketIO(_server, (theAction, theSocket) => {
      theAction.meta.user = theSocket.request.user;
      _dispatch(theAction);
    });
    _server.emit('connection', _socket);
    const data = `{"type":"${type}"}`;
    _socket.emit(message.action, data);
    const action = {type, meta: {client, user: {name: 'admin'}}};
    expect(_dispatch).to.be.calledWith(action);

  });

});
