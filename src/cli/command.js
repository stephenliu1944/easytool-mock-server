const path = require('path');
const yargs = require('yargs');
const pkg = require('../../package.json');
const server = require('../server');

const { _, host, port, proxy, watch, static: staticPath, config } = yargs
    .usage('mock-server [options] <source>')
    .options({
        host: {
            alias: 'H',
            description: 'Set host'
        },
        port: {
            alias: 'P',
            description: 'Set port'
        },
        proxy: {
            alias: 'p',
            description: 'Set proxy'
        },
        watch: {
            alias: 'w',
            description: 'Watch file(s)'
        },
        static: {
            alias: 's',
            description: 'Set static files directory'
        },
        config: {
            alias: 'c',
            description: 'Path to config file'
        }
    })
    .boolean('watch')
    .help('help')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .require(1, 'Missing <source> argument').argv;

server.startup({
    host: host,
    port: port,
    proxy: proxy,
    watch: watch,
    sourcePath: _[0] ? path.resolve(_[0]) : undefined,
    staticPath: staticPath ? path.resolve(staticPath) : undefined
}, config ? path.resolve(config) : undefined);