#!/usr/bin/env node

var exec = require('child_process').execSync;
var os = require('os');

switch (os.type()) {
  case "Windows_NT":
    exec("dir node_modules\\witnet-ethereum-bridge && yarn compile")
    exec("mkdir build\\contracts\\ && copy node_modules\\witnet-ethereum-bridge\\build\\**\\**\\*.json build\\contracts")
    break;
  default:
    exec("cd node_modules/witnet-ethereum-bridge && yarn compile")
    exec("mkdir -p build/contracts/ && cp node_modules/witnet-ethereum-bridge/build/**/**/*.json build/contracts")
}