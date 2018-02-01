// Copyright 2004-present Facebook. All Rights Reserved.

const tsc = require('typescript');
const babelJest = require('babel-jest');
require('babel-register');
const webpackAlias = require('jest-webpack-alias');



const buble = require('buble');
const regenerator = require('regenerator');

function typescriptTranspile(src, filename) {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    return tsc.transpile(
      src,
      {
        module: tsc.ModuleKind.CommonJS,
        jsx: tsc.JsxEmit.Preserve,
      },
      filename,
      []
    );
  }
  
  return src;
}

function bubleProcess(source) {
  return buble.transform(source, { target: { node: 6 } }).code;
}

function regeneratorProcess(es6Source) {
  return regenerator.compile(es6Source, {
    includeRuntime: false
  }).code;
}

function babelProcess(src, filename) {
  return babelJest.process(src, filename);
}

module.exports = {
  process(src, filename) {
    src = typescriptTranspile(src, filename);
    src = babelProcess(src, filename);

    return src;
  },
};