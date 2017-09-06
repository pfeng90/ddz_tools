#!/usr/bin/env node

const fs = require('fs');
const folder = require("./folder");

function hasTerm(term, dir, ext)
{
    let files = folder.scanSync(dir, ext, true);
    let count = files.length;
    for (let i = 0; i < count; i++)
    {
        let data = fs.readFileSync(files[i], 'utf-8');
        if (data.search(term) != -1)
        {
            return true;
        }
    }
    return false;
}

module.exports = {
    hasTerm
};
