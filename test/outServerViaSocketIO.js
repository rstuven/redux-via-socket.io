import sinon from 'sinon';
import {expect} from 'chai';
import {outServerViaSocketIO} from '..';
import {message} from '../src/constants';

describe('outServerViaSocketIO', () => {

  const type = 'ACTION';
  const client = '12345';

  describe('no filter', () => {

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

    it('should not broadcast and pass to next', () => {
      const action = {type, meta: {broadcast: false, next: false}}; // ignore next value
      middleware(action);

      expect(server.emit).to.have.not.been.called;
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

  describe('with filter', () => {

    let server;
    let next;
    let middleware;

    beforeEach(() => {
      server = {
        to: sinon.stub(),
        on: () => {}, // nothing, yet
      };
      server.sockets = {connected: {}};
      let nextSocketId = 1;
      ['user1', 'user2', 'user1'].forEach(user => {
        const id = (nextSocketId++).toString();
        const socket = {
          id,
          user, // this would be added by the application
          emit: sinon.spy(),
        };
        server.sockets.connected[id] = socket;
        server.to.withArgs(id).returns(socket);
      });
      next = sinon.spy();

      const filter = (action, socket) =>
        action.meta.user === socket.user && action.meta.client !== socket.id;

      middleware = outServerViaSocketIO(server, filter)()(next);
    });

    it('should broadcast to filtered and pass to next', () => {
      middleware({type, meta: {broadcast: true, user: 'user1'}});

      const json = `{"type":"${type}","meta":{"broadcast":true,"user":"user1"}}`;
      expect(server.sockets.connected['1'].emit).to.have.been.calledWith(message.action, json);
      expect(server.sockets.connected['2'].emit).to.have.not.been.called;
      expect(server.sockets.connected['3'].emit).to.have.been.calledWith(message.action, json);
      expect(next).to.have.been.called;
    });

    it('should broadcast to filtered and stop', () => {
      middleware({type, meta: {broadcast: true, user: 'user1', next: false}});

      const json = `{"type":"${type}","meta":{"broadcast":true,"user":"user1","next":false}}`;
      expect(server.sockets.connected['1'].emit).to.have.been.calledWith(message.action, json);
      expect(server.sockets.connected['2'].emit).to.have.not.been.called;
      expect(server.sockets.connected['3'].emit).to.have.been.calledWith(message.action, json);
      expect(next).to.have.not.been.called;
    });

    it('should broadcast to filtered except client', () => {
      middleware({type, meta: {broadcast: true, user: 'user1', client: '1'}});

      const json = `{"type":"${type}","meta":{"broadcast":true,"user":"user1","client":"1"}}`;
      expect(server.sockets.connected['1'].emit).to.have.not.been.called;
      expect(server.sockets.connected['2'].emit).to.have.not.been.called;
      expect(server.sockets.connected['3'].emit).to.have.been.calledWith(message.action, json);
      expect(next).to.have.been.called;
    });

  });
});
