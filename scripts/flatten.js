#!/usr/bin/env node

var exec = require('child_process').exec;
var os = require('os');

switch (os.type()) {
  case "Windows_NT":
    exec("mkdir contracts\\flattened\\ && npx truffle-flattener contracts\\requests\\BitcoinPrice.sol > contracts\\flattened\\Flattened.sol")
    break;
  default:
    exec("mkdir -p contracts/flattened/ 2>/dev/null; rm -f contracts/flattened/Flattened.sol ; npx truffle-flattener contracts/*.sol > contracts/flattened/Flattened.sol")
}