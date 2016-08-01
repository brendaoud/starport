const starport = require('../').default

starport.connect({
  server: {
    'address': 'localhost',
    'port': 8888
  },
  computer: 'foo',
  channel: 'starport',
  packers: [{ handler: data => console.log('=>', data) }],
  unpackers: [{ handler: data => console.log('<=', data) }]
})

starport.on('pong', function () {
  console.log('get ponged')
})

var count = 0
setInterval(function () {
  starport.emit('ping', ++count)
}, 1000)
