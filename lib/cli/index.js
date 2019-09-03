#!/usr/bin/env node
"use strict";

const yargs = require('yargs');

const pkg = require('../../package.json');

const server = require('../server/server');

const argv = yargs.usage('mock-server [options] <source>').options({
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
  source: {
    alias: 'S',
    description: 'Set data source files directory'
  },
  static: {
    alias: 's',
    description: 'Set static files directory'
  },
  config: {
    alias: 'c',
    description: 'Path to config file'
  }
}).boolean('watch').help('help').alias('help', 'h').version(pkg.version).alias('version', 'v').argv;
server({
  host: argv.host,
  port: argv.port,
  watch: argv.watch,
  sourcePath: argv._[0],
  staticPath: argv.static
}, argv.config);