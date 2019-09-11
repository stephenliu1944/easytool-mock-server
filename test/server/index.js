const path = require('path');
var server = require('../../src/server');

server.startup({
    watch: true,
    sourcePath: path.resolve(__dirname, '../data'),
    staticPath: path.resolve(__dirname, '../static')
}, path.resolve(__dirname, '../fake.config.js'));