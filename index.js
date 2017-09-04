#!/usr/bin/env node
const program = require('commander');
const folder = require('./folder');
const parser = require('./parser');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-d, --directory [value]', 'The directory of csb files.')
    .parse(process.argv);

if (program.directory)
{
    let files = folder.scanSync(program.directory, 'csd', true);
    files.forEach(file => {
        console.log(parser.findPng(file));
    })
}

