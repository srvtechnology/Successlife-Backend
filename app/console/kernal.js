#!/usr/bin/env node

require('dotenv').config();
require('../helper/functions');
require('../helper/string');

const program               = require('commander');
const test                  = require('./commands/test');
const admin_program         = require('./commands/admin');
const boilerplate           = require('./commands/boilerplate');
const permission_program    = require('./commands/permission');

    

program.version('1.0.0')
program.description('SR Marketplace command line interface');
program.test;
program.admin_program;
program.boilerplate;



/****CUSTOM COMMAND LINE INTERFACE START*****/
program.permission_program;
/****CUSTOM COMMAND LINE INTERFACE END*****/


program.parse(process.argv);

program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});