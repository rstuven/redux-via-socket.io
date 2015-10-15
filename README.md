redux-via-socket.io
===================

[redux-via](https://github.com/rstuven/redux-via) Socket.IO adapter.

## Usage

```
npm install --save redux-via-socket.io
```

#### Client side

```js
import io from 'socket.io-client';
import {outClientViaSocketIO, inClientViaSocketIO} from 'redux-via-socket.io';
// ...
const socket = io('...'); // socket.io client initialization

const finalCreateStore = compose(
  applyMiddleware(
    outClientViaSocketIO(socket), // initialize for outcoming actions
    anotherMiddleware,
    yetAnotherMiddleware,
  )
)(createStore);

const store = finalCreateStore(rootReducer, initialState);

// initialize for incoming actions
inClientViaSocketIO(socket, store.dispatch);

```

#### Server side

```js
import Server from 'socket.io';
import {outServerViaSocketIO, inServerViaSocketIO} from 'redux-via-socket.io';
// ...
const server = new Server({...}); // socket.io server initialization

const finalCreateStore = compose(
  applyMiddleware(
    outServerViaSocketIO(server), // initialize for outcoming actions
    anotherMiddleware,
    yetAnotherMiddleware,
  )
)(createStore);

const store = finalCreateStore(rootReducer, initialState);

// initialize for incoming actions
inServerViaSocketIO(server, store.dispatch);

```

You can also tweak the incoming actions before dispatch them
using socket metadata. For example, if you're using something like
[passport.socketio](https://github.com/jfromaniello/passport.socketio):

```js
inServerViaSocketIO(server, (action, socket) => {
  action.meta.user = socket.request.user;
  store.dispatch(action);
});
```


## Meta options

Action flow is controlled by [options specified in the `meta` property](https://github.com/rstuven/redux-via#meta-options).

---

## License

MIT
