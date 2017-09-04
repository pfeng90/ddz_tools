#!/usr/bin/env node

const fs = require('fs');
const convert = require('xml-js');


function findPng(file)
{
    let data = fs.readFileSync(file);
    let json = convert.xml2json(data, {compact: true, spaces: 4});
    let obj = JSON.parse(json);
    return obj;
}

module.exports = {
    findPng
};
