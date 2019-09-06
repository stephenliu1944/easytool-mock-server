var server = require('../../src/server');

server.startup({
    sourcePath: './test/data',
    staticPath: './test/static'
});