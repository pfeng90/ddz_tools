#!/usr/bin/env node

const fs = require('fs');

const program = require('commander');
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
    .parse(process.argv);

if (program.directory)
{
    let files = folder.scanSync(program.directory, 'csd', true);
    files.forEach(file => {
        let pngs = parser.findPng(file);
        copyer.copyPng('/Users/baina/Workshop/game-hydra-develop/game_client/Resources', '/Users/baina/Desktop/output', pngs);
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
                    }
                }
                else
                {
                    console.log(k);
                }
            }
        }
        console.log(`--------------- Extra Csb --------------------`);
        for (let k in json.csb_map)
        {
            if (!findTerm(k))
            {
                console.log(k);
            }
        }
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
        copyer.copyPng('/Users/baina/Workshop/game-hydra-develop/game_client/Resources', '/Users/baina/Desktop/output', list);
    }
    else
    {
        console.log('configure file does not exist!');
    }
}
