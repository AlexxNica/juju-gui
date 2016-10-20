#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const babel = require('babel-cli/node_modules/babel-core');
const mkdirp = require('mkdirp');
// FILE_LIST will be a space delimited list of paths that need to be built.
const fileList = process.env.FILE_LIST.split(' ');
const rootDir = path.join(__dirname, '/../');

const plugins = [
  'transform-react-jsx'
];

fileList.forEach(file => {
  const fileParts = file.split('/');
  const fileName = fileParts.pop();
  const directory = rootDir + fileParts.join('/').replace('/src/', '/build/');
  const fullPath = `${directory}/${fileName}`;

  fs.readFile(rootDir + file, {
    encoding: 'utf-8'
  }, (err, data) => {
    console.log('Transpiling', fullPath);
    mkdirp.sync(directory);
    const full = babel.transform(data, { plugins });
    fs.writeFile(fullPath, full.code);
    const min = babel.transform(data, {
      presets: ['babel-preset-babili'],
      plugins,
      compact: true,
      comments: false
    });
    fs.writeFile(`${fullPath.replace('.js', '-min.js')}`, min.code);
  });
});
