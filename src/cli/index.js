#!/usr/bin/env node

const yargs = require('yargs');
const pkg = require('../../package.json');
const server = require('../server');

const argv = yargs
    .usage('mock-server [options] <source>')
    .options({
        host: {
            alias: 'H',
            description: 'Set host'
        },
        port: {
            alias: 'p',
            description: 'Set port'
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
    host: argv.host,
    port: argv.port,
    watch: argv.watch,
    sourcePath: argv._[0],
    staticPath: argv.static
}, argv.config);