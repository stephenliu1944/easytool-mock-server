const yargs = require('yargs');
const pkg = require('../../package.json');
const server = require('../server/server');

const argv = yargs
    .usage('$0 [options] <source>')
    .options({
        port: {
        alias: 'p',
        description: 'Set port',
        default: 3000
        },
        host: {
        alias: 'h',
        description: 'Set host',
        default: 'localhost'
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
            description: 'Path to config file',
            default: 'json-server.json'
        })
    .boolean('watch')
    .help('help')
    .alias('help', 'h')
    .version(pkg.version)
    .alias('version', 'v')
    .require(1, 'Missing <source> argument').argv;

server(argv);