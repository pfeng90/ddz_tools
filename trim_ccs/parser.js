#!/usr/bin/env node

const fs = require('fs');
const convert = require('xml-js');


function _searchPngInList(jsonArr, list)
{
    jsonArr.forEach(i => {
        _searchPng(i, list);
    })
}

function _searchPng(jsonObj, list)
{
    for (let o in jsonObj)
    {
        let obj = jsonObj[o];
        if (o === 'DisabledFileData' || 
            o === 'PressedFileData' || 
            o === 'NormalFileData' ||
            o === 'NormalBackFileData' ||
            o === 'PressedBackFileData' ||
            o === 'DisableBackFileData' ||
            o === 'NodeNormalFileData' ||
            o === 'NodeDisableFileData' ||
            o === 'ImageFileData' ||
            o === 'BackGroundData' ||
            o === 'ProgressBarData' ||
            o === 'BallNormalData' ||
            o === 'BallPressedData' ||
            o === 'BallDisabledData' ||
            o === 'FileData')
        {
            let a = obj._attributes;
            if (a.Type === 'MarkedSubImage')
            {
                list.push(a.Path);
            }
            else if (a.Type === 'Normal')
            {
                if (a.Path.endsWith('.jpg'))
                {
                    list.push(a.Path);
                }
            }
        }
        else if(!o.startsWith('_'))
        {
            if (Object.prototype.toString.call(obj) === '[object Object]')
            {
                _searchPng(obj, list);
            }
            else if (Object.prototype.toString.call(obj) === '[object Array]')
            {
                _searchPngInList(obj, list);
            }
        }
    }
}

function findPng(file)
{
    // console.log(file);
    let data = fs.readFileSync(file);
    let json = convert.xml2json(data, {compact: true, space: 4});
    let obj = JSON.parse(json);
    let lt = [];
    _searchPng(obj, lt);
    return lt;
}

module.exports = {
    findPng
};
