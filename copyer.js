#! /usr/bin/env node

const path = require('path');
const fs = require('fs-extra');


module.exports = {
    copyPng : function(sdir, tdir, files) {
        if(files instanceof Array && fs.existsSync(sdir) && fs.existsSync(tdir))
        {
            files.forEach(function (file) {
                var sPath = path.join(sdir, file.split('/').join(path.sep));
                console.log(sPath);
                if (fs.existsSync(sPath))
                {
                    var tPath = path.join(tdir, file.split('/').join(path.sep));
                    if (!fs.existsSync(tPath))
                    {
                        fs.mkdirsSync(path.dirname(tPath));
                    }
                    fs.copySync(sPath, tPath);
                }
            })
        }
    }
};
