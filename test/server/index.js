const path = require('path');
var server = require('../../src/server');

server.startup({
    watch: true,
    proxy: 'http://localhost:8080',
    sourcePath: path.resolve(__dirname, '../data'),
    staticPath: path.resolve(__dirname, '../static')
}, path.resolve(__dirname, '../mock.config.js'));