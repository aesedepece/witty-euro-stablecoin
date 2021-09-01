const baseTruffleConfig = require("./truffle-config")

module.exports = {
  ...baseTruffleConfig,
  contracts_directory: "./contracts/flattened/",
}
