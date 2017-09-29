#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const program = require('commander');
const nunjucks = require('nunjucks');
const convert = require('xml-js');
const tmp = require('tmp');

const folder = require('./folder');
const parser = require('./parser');
const copyer = require('./copyer');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-c, --ccs [value]', 'the path of ccs project file.')
    .parse(process.argv);

if (program.ccs && fs.existsSync(program.ccs))
{
    let base_dir = path.dirname(program.ccs);
    let csd_dir = path.join(base_dir, 'cocosstudio', 'layout');
    let img_dir = path.join(base_dir, 'cocosstudio');
    let csi_dir = path.join(img_dir, 'images', 'package')
    let tmpdir = tmp.dirSync();
    let temp_dir = tmpdir.name;
    let files = folder.scanSync(csd_dir, 'csd', true);
    files.forEach(file => {
        let pngs = parser.findPng(file);
        copyer.copyPng(img_dir, temp_dir, pngs);
    })
    fs.moveSync(csi_dir, path.join(temp_dir, 'package'), { overwrite: true });
    fs.moveSync(path.join(temp_dir, 'images'), path.join(img_dir, 'images'), { overwrite: true });
    fs.moveSync(path.join(temp_dir, 'package'), csi_dir, { overwrite: true });

    let images_path = path.join(img_dir, 'images');
    let csis = folder.scanSync(csi_dir, 'csi')
    csis.forEach(csi => {
        let base = path.basename(csi, '.csi');
        let base_path = path.join(images_path, base);
        let prefix = `images/${base}/`
        if (fs.existsSync(base_path))
        {
            let c = fs.readFileSync(csi);
            let cjs = convert.xml2js(c, {compact: true});
            let pngs = folder.scanSync(base_path, 'png', true);
            let real_images = [];
            pngs.forEach(png => {
                let a = { _attributes: { Path: '' } };
                a._attributes.Path = prefix + png.substring(base_path.length + 1);
                real_images.push(a);
            })
            cjs.PlistInfoProjectFile.Content.ImageFiles.FilePathData = real_images;
            fs.writeFileSync(csi, convert.js2xml(cjs, {compact: true, spaces: 2}));
        }
        else
        {
            fs.removeSync(csi);
        }
    });
    
    let templates = `
          <Folder Name="{{ FOLDER_NAME }}">
            {%- for png in PNGS %}
            <Image Name="{{ png }}" />
            {%- endfor %}
            {%- for jpg in JPGS %}
            <Image Name="{{ jpg }}" />
            {%- endfor %}
            {%- for fnt in FNTS %}
            <Fnt Name="{{ fnt }}" />
            {%- endfor %}
            {%- for csi in CSIS %}
            <PlistInfo Name="{{ csi }}" />
            {%- endfor %}
            {%- for csd in CSDS %}
            <Project Name="{{ csd }}" />
            {%- endfor %}
            {%- for ttf in TTFS %}
            <File Name="{{ ttf }}" />
            {%- endfor %}
            {{ SUB_DIRECTORY }}
          </Folder>
    `;
    
    let scanDir = function(dir, exclude)
    {
        let dir_name = path.basename(dir);
        let all_files = fs.readdirSync(dir);
        let pngs = [];
        let jpgs = [];
        let fnts = [];
        let csis = [];
        let csds = [];
        let ttfs = [];
        let sub_directory = '';
        all_files.forEach(function(file){
            let fPath = path.join(dir, file);
            let fState = fs.statSync(fPath);
            if (fState.isFile())
            {
                let ext = path.extname(file);
                if (ext !== exclude)
                {
                    switch(ext)
                    {
                    case '.png':
                        pngs.push(file);
                        break;
                    case '.jpg':
                        jpgs.push(file);
                        break;
                    case '.fnt':
                        fnts.push(file);
                        break;
                    case '.csi':
                        csis.push(file);
                        break;
                    case '.csd':
                        csds.push(file);
                        break;
                    case '.ttf':
                        ttfs.push(file);
                        break;
                    default:
                        break;
                    }
                }
            }
            else if (fState.isDirectory())
            {
                sub_directory += scanDir(fPath);
            }
        })
        return nunjucks.renderString(templates, { FOLDER_NAME: dir_name, PNGS: pngs, JPGS: jpgs, FNTS: fnts, CSIS: csis, CSDS: csds, TTFS: ttfs, SUB_DIRECTORY: sub_directory });
    }
    
    nunjucks.configure({ autoescape: false });
    let fonts_content = scanDir(path.join(base_dir, 'cocosstudio', 'fonts'), '.png');
    let images_content = scanDir(path.join(base_dir, 'cocosstudio', 'images'));
    let layouts_content = scanDir(path.join(base_dir, 'cocosstudio', 'layout'), '.png');
    let data = nunjucks.render('templates/Hydra_ZJH.ccs.nunjucks', { IMAGES_CONTENT: images_content, LAYOUT_CONTENT: layouts_content, FONTS_CONTENT: fonts_content });
    fs.writeFileSync(program.ccs, data);
    
    tmpdir.removeCallback();
}
else
{
    console.log('can not find ccs file.');
}


