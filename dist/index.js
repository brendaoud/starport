'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _spacebroClient = require('spacebro-client');

var _spacebroClient2 = _interopRequireDefault(_spacebroClient);

var _signals = require('signals');

var _signals2 = _interopRequireDefault(_signals);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultOptions = {
  computer: false,
  channel: false,
  server: false,
  packers: [],
  unpackers: []
};

// Variables
var options = {};
var connected = false;
var unpackers = [];
var packers = [];
var events = {};

// Utils
function filterHooks(eventName, hooks) {
  return hooks.filter(function (hook) {
    return [eventName, '*'].indexOf(hook.eventName) !== -1;
  }).sort(function (hook) {
    return -hook.priority || 0;
  }).map(function (hook) {
    return hook.handler;
  });
}

function addHook(hooks) {
  var eventName = arguments.length <= 1 || arguments[1] === undefined ? '*' : arguments[1];
  var handler = arguments[2];
  var priority = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  hooks.push({ eventName: eventName, handler: handler, priority: priority });
}

function touch(eventName) {
  if (!_lodash2.default.has(events, eventName)) {
    events[eventName] = new _signals2.default();
  }
  return events[eventName];
}

// Initialization
function connect(opt) {
  options = _lodash2.default.merge({}, defaultOptions, opt);
  if (!options.computer) {
    console.error('Starport - You must set a computer name!');
    return;
  }
  if (!options.channel) {
    console.error('Starport - You must set a channel name!');
    return;
  }
  if (options.server) setServer(options.server.address, options.server.port);
  _spacebroClient2.default.registerToMaster([{
    name: options.channel,
    trigger: function trigger(data) {
      // console.log('received', data)
      if (data.from === options.computer) return;
      if (data.to != null && data.to !== options.computer) return;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = filterHooks(data.eventName, unpackers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var unpack = _step.value;

          var unpacked = unpack(data);
          if (unpacked === false) return;
          data = unpacked || data;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (_lodash2.default.has(events, data.eventName)) {
        var _events$data$eventNam;

        (_events$data$eventNam = events[data.eventName]).dispatch.apply(_events$data$eventNam, _toConsumableArray(data.args));
      }
    }
  }], options.computer);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = options.packers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var packer = _step2.value;

      addPacker(packer.handler, packer.priority, packer.eventName);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = options.unpackers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var unpacker = _step3.value;

      addUnpacker(unpacker.handler, unpacker.priority, unpacker.eventName);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  connected = true;
}

function setServer(address, port) {
  if (!address) {
    console.warn('Startport - Invalid server address:', address);
    return;
  }
  if (!port) {
    console.warn('Startport - Invalid server port:', port);
    return;
  }
  _spacebroClient2.default.iKnowMyMaster(address, port);
}

function addPacker(handler, priority, eventName) {
  addHook(packers, eventName, handler, priority);
}
function addUnpacker(handler, priority, eventName) {
  addHook(unpackers, eventName, handler, priority);
}

// Emission
function emit(eventName) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  sendTo.apply(undefined, [eventName, null].concat(args));
}

function sendTo(eventName, to) {
  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  if (!connected) return console.warn('Starport - You\'re not connected.');
  var data = {
    to: to, eventName: eventName, args: args,
    from: options.computer
  };
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = filterHooks(eventName, packers)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var pack = _step4.value;

      data = pack(data, eventName) || data;
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  _spacebroClient2.default.emit(options.channel, data);
}

// Reception
function on(eventName, handler, handlerContext, priority) {
  if (!connected) return console.warn('Starport - You\'re not connected.');
  var event = touch(eventName);
  return event.add(handler, handlerContext, priority);
}

function once(eventName, handler, handlerContext, priority) {
  if (!connected) return console.warn('Starport - You\'re not connected.');
  var event = touch(eventName);
  return event.addOnce(handler, handlerContext, priority);
}

// Disposal
function clear(eventName) {
  var event = touch(eventName);
  return event.removeAll();
}

function remove(eventName, listener, context) {
  var event = touch(eventName);
  return event.remove(listener, context);
}

function dispose() {
  for (var eventName in events) {
    var event = touch(eventName);
    event.dispose();
  }
}

exports.default = {
  setServer: setServer, connect: connect, addPacker: addPacker, addUnpacker: addUnpacker,
  emit: emit, sendTo: sendTo,
  on: on, once: once,
  clear: clear, remove: remove, dispose: dispose
};