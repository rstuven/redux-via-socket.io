import sinon from 'sinon';
import {expect} from 'chai';
import {outServerViaSocketIO} from '..';
import {message} from '../src/constants';

describe('outServerViaSocketIO', () => {

  const type = 'ACTION';
  const client = '12345';

  let server;
  let socket;
  let next;
  let middleware;

  beforeEach(() => {
    server = {
      emit: sinon.spy(),
      to: sinon.stub(),
      on: () => {}, // nothing, yet
    };
    socket = {
      emit: sinon.spy(),
      broadcast: {
        emit: sinon.spy(),
      },
    };
    server.to.withArgs(client).returns(socket);
    server.sockets = {connected: {[client]: socket}};
    next = sinon.spy();
    middleware = outServerViaSocketIO(server)()(next);
  });

  it('should pass to next', () => {
    const action = {type};
    middleware(action);

    expect(server.emit).to.have.not.been.called;
    expect(socket.emit).to.have.not.been.called;
    expect(socket.broadcast.emit).to.have.not.been.called;
    expect(next).to.have.been.calledWith(action);
  });

  it('should broadcast and pass to next', () => {
    const action = {type, meta: {broadcast: true}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"broadcast":true}}`;
    expect(server.emit).to.have.been.calledWith(message.action, json);
    expect(socket.emit).to.have.not.been.called;
    expect(socket.broadcast.emit).to.have.not.been.called;
    expect(next).to.have.been.calledWith(action);
  });

  it('should broadcast to all except client and pass to next', () => {
    const action = {type, meta: {broadcast: true, client}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"broadcast":true,"client":"${client}"}}`;
    expect(server.emit).to.have.not.been.called;
    expect(socket.emit).to.have.not.been.called;
    expect(socket.broadcast.emit).to.have.been.calledWith(message.action, json);
    expect(next).to.have.been.calledWith(action);
  });

  it('should broadcast and stop', () => {
    const action = {type, meta: {broadcast: true, next: false}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"broadcast":true,"next":false}}`;
    expect(server.emit).to.have.been.calledWith(message.action, json);
    expect(socket.emit).to.have.not.been.called;
    expect(socket.broadcast.emit).to.have.not.been.called;
    expect(next).to.have.not.been.called;
  });

  it('should send to client and pass to next', () => {
    const action = {type, meta: {client}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"client":"${client}"}}`;
    expect(server.emit).to.have.not.been.called;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(socket.broadcast.emit).to.have.not.been.called;
    expect(next).to.have.been.calledWith(action);
  });

  it('should send to client and stop', () => {
    const action = {type, meta: {client, next: false}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"client":"${client}","next":false}}`;
    expect(server.emit).to.have.not.been.called;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(socket.broadcast.emit).to.have.not.been.called;
    expect(next).to.have.not.been.called;
  });

});
