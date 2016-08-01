# StarPort
An extended [spaceBro](https://github.com/soixantecircuits/spacebro) client

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![node](https://img.shields.io/badge/node-5.3.x-brightgreen.svg)](https://nodejs.org/en/)

## Why use starPort ?
1. It uses channels, and prevent conflicts.
2. You can send events to specific part of the network, to prevent conflicts.
3. You can trace easily, who sent an event and to whom.
4. It has hooks for you to use.

## Basic Usage
```
import starPort from 'starport'

starport.connect({
  server: {
    'address': 'localhost',
    'port': 8888
  },
  computer: 'foo',
  channel: 'starport'
})

starport.on('pong', () => console.log('pong'))
starport.emit('ping')
```

## Basic API
### starPort.connect(Options)

Allows you to connect your starport to a spaceBro server. Options is hash table of settings that will be used to define your starport.

Available options are :
- **computer** (required) : The name of your app that will be used to receive and send events.
- **channel** (required) : The common channel your apps will share. This will allow your to have multiple apps using the same server without worring about conflicts.
- **server** (optional) : Hash containing an *address* and a *port*. Is no server options are set, spaceBro-client will not use mdns.
- **packers** (optional) : Array of packers (see Hooks below), defined as hash object with the properties *handler* (required), *eventName* (all if null), *priority* (0 if null).
- **unpackers** (optional) : Array of unpackers (see Hooks below), defined as hash object with the properties *handler* (required), *eventName* (all if null), *priority* (0 if null).

### starPort.emit(eventName, ...args)
Broadcast a specific event to all the apps in the channel.

### starPort.sendTo(eventName, target, ...args)
Send an event to a specific target in the channel.

### starPort.on(eventName, handler)
Listen to a specific event.

### starPort.once(eventName, handler)
Listen to a specific event, the listener only once.

## Hooks
### StarPort messages
Event sent to spaceBro by sratPort are an hash table with the following properties :
- eventName (String)
- from (String) : computer name of the sending app
- to (String or Null) : computer name of the target or null if there is no target
- args (Array) : List of argurments to be passed to the handlers

### Packers
Before you send an event to spaceBro, all packers associated with that event and all global packers (with no associated event) are called and applied to that event. They receive a single argument which is the whole starPort message object and can return a new version of that message. If nothing is returned, the message will remain unchanged.

### Unpackers
Unpackers are call when you receive a message from spaceBro, before any handler is called. You can use to alter data (same as packers) but also to check the message as if an unpacker returns *false*, the message will not be sent to the handlers, it will also break the unpacking chain.

## Contribute
You can modify the source in `src/index.js`. Run `npm run build` to transpile and test.
Please follow [standard style](https://github.com/feross/standard) conventions.
