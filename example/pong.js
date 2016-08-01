const starport = require('../').default

starport.connect({
  server: {
    'address': 'localhost',
    'port': 8888
  },
  computer: 'bar',
  channel: 'starport'
})

starport.on('ping', function (val) {
  console.log('get pinged', val, 'times')
  starport.emit('pong')
})
