#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

function scan(dir, callback, ext, recursive) {
    fs.readdir(dir, function (err, files)
    {
        if (err)
            throw err;
        files.forEach(function (file) {
            var fPath = path.join(dir, file);
            var fState = fs.statSync(fPath);
            if (fState.isFile() && path.extname(file) == '.' + ext)
            {
                callback(fPath);
            }

            if(fState.isDirectory() && recursive)
            {
                scan(fPath, callback, ext, true);
            }
        });
    })
}

function scanSync(dir, ext, recursive)
{
    var ret = [];
    var files = fs.readdirSync(dir);
    files.forEach(function(file){
        var fPath = path.join(dir, file);
        var fState = fs.statSync(fPath);
        if (fState.isFile() && path.extname(file) == '.' + ext)
        {
            ret.push(fPath);
        }

        if(fState.isDirectory() && recursive)
        {
            var r = scanSync(fPath, ext, true);
            ret = ret.concat(r);
        }
    })
    return ret;
}

exports.scan = scan;
exports.scanSync = scanSync;