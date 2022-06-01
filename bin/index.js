#! /usr/bin/env node
const utils = require('./utils.js')
const fs=require('fs');


const yargs = require("yargs");

if(yargs.argv.i && yargs.argv._[0]){
    utils.readCsv(yargs.argv.i,yargs.argv._[0]);
    return;
}


