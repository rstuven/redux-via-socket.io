import sinon from 'sinon';
import {expect} from 'chai';
import {outClientViaSocketIO} from '..';
import {message} from '../src/constants';

describe('outClientViaSocketIO', () => {

  const type = 'ACTION';

  let socket;
  let next;
  let middleware;

  beforeEach(() => {
    socket = {
      emit: sinon.spy(),
      on: () => {}, // nothing, yet
    };
    next = sinon.spy();
    middleware = outClientViaSocketIO(socket)()(next);
  });

  it('should pass to next', () => {
    const action = {type};
    middleware(action);

    expect(socket.emit).to.have.not.been.called;
    expect(next).to.have.been.calledWith(action);
  });

  it('should throw error trying to send to server', () => {
    const action = {meta: {server: true}};
    expect(() => {
      middleware(action);
    }).throw('Argument is not a Flux Standard Action');
    expect(socket.emit).to.have.not.been.called;
    expect(next).to.have.not.been.called;
  });

  it('should send to server and pass to next', () => {
    const action = {type, meta: {server: true}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"server":true}}`;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(next).to.have.been.calledWith(action);
  });

  it('should send server and stop', () => {
    const action = {type, meta: {server: true, next: false}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"server":true,"next":false}}`;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(next).to.have.not.been.called;
  });

  it('should throw error trying to broadcast', () => {
    const action = {meta: {broadcast: true}};
    expect(() => {
      middleware(action);
    }).throw('Argument is not a Flux Standard Action');
    expect(socket.emit).to.have.not.been.called;
    expect(next).to.have.not.been.called;
  });

  it('should broadcast and pass to next', () => {
    const action = {type, meta: {broadcast: true}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"broadcast":true}}`;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(next).to.have.been.calledWith(action);
  });

  it('should broadcast and stop', () => {
    const action = {type, meta: {broadcast: true, next: false}};
    middleware(action);

    const json = `{"type":"${type}","meta":{"broadcast":true,"next":false}}`;
    expect(socket.emit).to.have.been.calledWith(message.action, json);
    expect(next).to.have.not.been.called;
  });

});
