#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const program = require('commander');
const convert = require('xml-js');
const folder = require('./folder');
const parser = require('./parser');
const searcher = require('./searcher');
const copyer = require('./copyer');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-d, --directory [value]', 'The directory of csb files.')
    .option('-s, --scan-config [value]', 'The configure file to scan.')
    .option('-c, --copy [value]', 'The copy command.')
    .option('-t, --delete-config [value]', 'Delete unuse image in cocos studio project.')
    .parse(process.argv);

if (program.directory)
{
    let files = folder.scanSync(program.directory, 'csd', true);
    files.forEach(file => {
        let pngs = parser.findPng(file);
        copyer.copyPng('/Users/baina/Desktop/input', '/Users/baina/Desktop/output', pngs);
    })
}

if (program.scanConfig)
{
    let config = program.scanConfig;
    if (fs.existsSync(config))
    {
        let data = fs.readFileSync(config);
        let json = JSON.parse(data);
        let findTerm = function(term)
        {
            let t = `${term}`;
            if( searcher.hasTerm(t, '/Users/baina/Workshop/game-hydra-develop/game_client/Classes', 'cpp') || 
                    searcher.hasTerm(t, '/Users/baina/Workshop/game-hydra-develop/game_client/Classes', 'h') ||
                    searcher.hasTerm(t, '/Users/baina/Workshop/game-hydra-develop/game_client/Resources/scripts', 'lua') ||
                    searcher.hasTerm(t, '/Users/baina/Workshop/game-hydra-develop/game_client/Resources/components', 'json'))
            {
                return true;
            }
            return false;
        }
        console.log(`--------------- Extra Png --------------------`);
        for (let k in json.image_map)
        {
            if (!findTerm(k))
            {
                let n = k.replace(/\d+/, '%d');
                if (n !== k)
                {
                    if (!findTerm(n))
                    {
                        console.log(k);
                        json.image_map[k] = undefined;
                    }
                }
                else
                {
                    console.log(k);
                    json.image_map[k] = undefined;
                }
            }
        }
        console.log(`--------------- Extra Csb --------------------`);
        for (let k in json.csb_map)
        {
            if (!findTerm(k))
            {
                console.log(k);
                json.csb_map[k] = undefined;
            }
        }
        console.log(`---------------- Export json --------------------`);
        fs.writeFileSync(path.join(path.dirname(config), 'config2.json'), JSON.stringify(json));
    }
    else
    {
        console.log('configure file does not exist!');
    }
}

if (program.copy)
{
    let config = program.copy;
    if (fs.existsSync(config))
    {
        let data = fs.readFileSync(config);
        let json = JSON.parse(data);
        let map = json.image_map;
        let list = [];
        for (let k in map)
        {
            list.push(map[k]);
        }
        copyer.copyPng('/Users/baina/Desktop/input', '/Users/baina/Desktop/output', list);
    }
    else
    {
        console.log('configure file does not exist!');
    }
}

if (program.deleteConfig)
{
    let config = program.deleteConfig;
    if (fs.existsSync(config))
    {
        let data = fs.readFileSync(config);
        let json = JSON.parse(data);
        let ccs = fs.readFileSync('/Users/baina/Workshop/game-hydra-develop/game_client/Classes/ZJH_Cocosstudio/Hydra_ZJH.ccs');
        let js = convert.xml2js(ccs, {compact: true});
        let imageFolder = null;
        let folders = js.Solution.SolutionFolder.Group.RootFolder.Folder;
        
        for (let i = 0; i < folders.length; i++)
        {
            let folder = folders[i];
            if (folder._attributes.Name === 'images')
            {
                imageFolder = folder;
                break;
            }
        }

        let deleteImage = function(folders, imagePath)
        {
            let pathArr = path.dirname(imagePath).split(path.sep);
            let imageName = path.basename(imagePath);
            let tempFolder = folders;
            for (let a = 0; a < pathArr.length; a++)
            {
                let tFolders = tempFolder.Folder;
                for(let f = 0; f < tFolders.length; f++)
                {
                    let folder = tFolders[f];
                    if (folder._attributes.Name === pathArr[a])
                    {
                        
                        tempFolder = folder;
                        break;
                    }
                }
            }
            
            let images = tempFolder.Image;
            if (images)
            {
                for(let i = 0; i < images.length; i ++)
                {
                    if (images[i]._attributes.Name === imageName)
                    {
                        console.log('remove in ccs : ' + imagePath);
                        images.splice(i, 1);
                        return;
                    }
                }
            }
            
        }

        if (imageFolder)
        {
            json.forEach(i => {
                deleteImage(imageFolder, i);
            });
            fs.writeFileSync('/Users/baina/Workshop/game-hydra-develop/game_client/Classes/ZJH_Cocosstudio/Hydra_ZJH.ccs', convert.js2xml(js, {compact: true, spaces: 4}));
        }
        
        let isInConfig = function(imgPath)
        {
            for(let j = 0; j < json.length; j++)
            {
                if (imgPath == 'images/' + json[j])
                {
                    return true;
                }
            }
            return false;
        }
        
        let csis = folder.scanSync('/Users/baina/Workshop/game-hydra-develop/game_client/Classes/ZJH_Cocosstudio/cocosstudio/images/package', 'csi')
        csis.forEach(csi => {
            let c = fs.readFileSync(csi);
            let cjs = convert.xml2js(c, {compact: true});
            let images = cjs.PlistInfoProjectFile.Content.ImageFiles.FilePathData;
            let wflag = false;
            for (let i = 0; i < images.length; i++)
            {
                let pathdata = images[i];
                if (isInConfig(pathdata._attributes.Path))
                {
                    console.log('delete in csi : ' + pathdata._attributes.Path);
                    images.splice(i, 1);
                    wflag = true;
                }
            }
            
            if (wflag)
            {
                fs.writeFileSync(csi, convert.js2xml(cjs, {compact: true, spaces: 2}));
            }
        });
        
        json.forEach(i => {
            console.log('delete in directory : ' + i);
            fs.removeSync(path.join('/Users/baina/Workshop/game-hydra-develop/game_client/Classes/ZJH_Cocosstudio/cocosstudio/images', i));
        });
    }
    else
    {
        console.log('configure file does not exist!');
    }
}
