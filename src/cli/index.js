#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const pkg = require('../../package.json');
const server = require('../server');

const { _, host, port, watch, static: staticPath, config } = yargs
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
            // default: 'mock.config.js'
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
    watch: watch,
    sourcePath: _[0] ? path.resolve(_[0]) : undefined,
    staticPath: staticPath ? path.resolve(staticPath) : undefined
}, config ? path.resolve(config) : undefined);