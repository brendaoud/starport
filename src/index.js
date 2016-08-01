import spacebroClient from 'spacebro-client'
import Signal from 'signals'
import _ from 'lodash'

const defaultOptions = {
  computer: false,
  channel: false,
  server: false,
  packers: [],
  unpackers: []
}

console.log(spacebroClient)

// Variables
let options = {}
let connected = false
let unpackers = []
let packers = []
let events = {}

// Utils
function filterHooks (eventName, hooks) {
  return hooks
    .filter(hook => [eventName, '*'].indexOf(hook.eventName) !== -1)
    .sort(hook => -hook.priority || 0)
    .map(hook => hook.handler)
}

function addHook (hooks, eventName = '*', handler, priority = 0) {
  hooks.push({ eventName, handler, priority })
}

function touch (eventName) {
  if (!_.has(events, eventName)) {
    events[eventName] = new Signal()
  }
  return events[eventName]
}

// Initialization
function connect (opt) {
  options = _.merge({}, defaultOptions, opt)
  if (!options.computer) {
    console.error('Starport - You must set a computer name!')
    return
  }
  if (!options.channel) {
    console.error('Starport - You must set a channel name!')
    return
  }
  if (options.server) setServer(options.server.address, options.server.port)
  spacebroClient.registerToMaster([{
    name: options.channel,
    trigger: function (data) {
      if (data.from === options.computer) return
      if (data.to && data.to !== options.computer) return
      for (let unpack of filterHooks(data.eventName, unpackers)) {
        let unpacked = unpack(data)
        if (unpacked === false) return
        data = unpacked || data
        if (_.has(events, data.eventName)) {
          events[data.eventName].dispatch(...data.args)
        }
      }
    }
  }], options.computer)
  for (let packer of options.packers) {
    addPacker(packer.handler, packer.priority, packer.eventName)
  }
  for (let unpacker of options.unpackers) {
    addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName)
  }
  connected = true
}

function setServer (address, port) {
  if (!address) {
    console.warn('Startport - Invalid server address:', address)
    return
  }
  if (!port) {
    console.warn('Startport - Invalid server port:', port)
    return
  }
  spacebroClient.iKnowMyMaster(address, port)
}

function addPacker (handler, priority, eventName) { addHook(packers, eventName, handler, priority) }
function addUnpacker (handler, priority, eventName) { addHook(unpackers, eventName, handler, priority) }

// Emission
function emit (eventName, ...args) {
  sendTo(eventName, null, ...args)
}

function sendTo (eventName, to, ...args) {
  if (!connected) return console.warn('Starport - You\'re not connected.')
  let data = {
    to, eventName, args,
    from: options.computer
  }
  for (let pack of filterHooks(eventName, packers)) {
    data = pack(data, eventName) || data
  }
  spacebroClient.emit(options.channel, data)
}

// Reception
function on (eventName, handler, handlerContext, priority) {
  if (!connected) return console.warn('Starport - You\'re not connected.')
  let event = touch(eventName)
  return event.add(handler, handlerContext, priority)
}

function once (eventName, handler, handlerContext, priority) {
  if (!connected) return console.warn('Starport - You\'re not connected.')
  let event = touch(eventName)
  return event.addOnce(handler, handlerContext, priority)
}

// Disposal
function clear (eventName) {
  let event = touch(eventName)
  return event.removeAll()
}

function remove (eventName, listener, context) {
  let event = touch(eventName)
  return event.remove(listener, context)
}

function dispose () {
  for (let eventName in events) {
    let event = touch(eventName)
    event.dispose()
  }
}

export default {
  setServer, connect, addPacker, addUnpacker,
  emit, sendTo,
  on, once,
  clear, remove, dispose
}
