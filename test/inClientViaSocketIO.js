import sinon from 'sinon';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {inClientViaSocketIO} from '..';
import {message} from '../src/constants';

describe('inClientViaSocketIO', () => {

  const type = 'ACTION';

  let socket;
  let dispatch;

  beforeEach(() => {
    socket = new EventEmitter();
    dispatch = sinon.spy();
    inClientViaSocketIO(socket, dispatch);
  });

  it('should dispatch', () => {
    const data = `{"type":"${type}"}`;
    socket.emit(message.action, data);
    const action = {type};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should throw error', () => {
    const data = `{}`;
    expect(() => {
      socket.emit(message.action, data);
    }).throw('Argument is not a Flux Standard Action');
    expect(dispatch).to.not.be.called;
  });

  it('should remove server before dispatch', () => {
    const data = `{"type":"${type}","meta":{"server":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should remove broadcast before dispatch', () => {
    const data = `{"type":"${type}","meta":{"broadcast":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {}};
    expect(dispatch).to.be.calledWith(action);
  });

  it('should remove next before dispatch', () => {
    const data = `{"type":"${type}","meta":{"next":true}}`;
    socket.emit(message.action, data);
    const action = {type, meta: {}};
    expect(dispatch).to.be.calledWith(action);
  });

});
