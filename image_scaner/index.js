#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');
const md5file = require('md5-file');
const Map = require('collections/map');
const image_size = require('image-size');

const folder = require('./folder');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-d, --directory [value]', 'The directory of png.')
    .parse(process.argv);



if (program.directory)
{
    if ( fs.existsSync(program.directory) )
    {
        let pngs = folder.scanSync( program.directory, 'png', true );
        let map = new Map();
        pngs.forEach( png => {
            let hash = md5file.sync(png);
            if (map.has(hash))
            {
                console.log('-----------------------------');
                console.log(map.get(hash));
                console.log(png);
                let st = fs.statSync(png);
                console.log('size :' + st['size'] + ' byte');
                let size = image_size(png);
                console.log(`${size.width}x${size.height}`);
            }
            else
            {
                map.set(hash, png);
            }
        });
    }
    else {
        console.log(`can't find path : ${program.directory}`);
    }
}
