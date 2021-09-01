/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const witnetSettings = require("./node_modules/witnet-ethereum-bridge/migrations/witnet.settings")
const realm = process.env.WITNET_EVM_REALM ? process.env.WITNET_EVM_REALM.toLowerCase() : "default"
const compilers = witnetSettings.compilers[realm]
const supportedNetworks = Object.entries(witnetSettings.networks).reduce((acc, [realmKey, realmVal]) => {
  let realmEmit
  if (realmKey === "default") {
    realmEmit = realmVal
  } else {
    realmEmit = Object.entries(realmVal).reduce((acc, [netKey, netVal]) => {
      let netEmit
      if (netKey.includes(realmKey)) {
        netEmit = { [netKey]: netVal }
      } else {
        netEmit = { [`${realmKey}.${netKey}`]: netVal }
      }
      return { ...acc, ...netEmit }
    }, {})
  }
  return { ...acc, ...realmEmit }
}, 0)

/**
 * Feel free to add here your own Truffle networks configuration.
 *
 * This Truffle Box comes with a series of preconfigured networks, under the assumption that suitable Web3 providers
 * are locally available on different ports at localhost:XXXX.
 *
 * For example:
 * - ethereum.mainnet → localhost:9545
 * - ethereum.kovan → localhost:8542
 * - ethereum.ropsten → localhost:8543
 * - ethereum.rinkeby → localhost:8544
 * - ethereum.goerli → localhost:8545
 * - conflux.testnet → localhost:8540
 * - conflux.tethys → localhost:9540
 * - boba.rinkeby → localhost:8539
 *
 * For example, if you want to deploy to Ethereum mainnet, you will need an Ethereum mainnet node, an account-enabled
 * Web3 gateway or an instance of ` @truffle/hdwallet-provider` running on localhost:9545.
 *
 * If you don't want to mess with any ot that, and prefer to configure an HDWalletProvider in the classic way, simply
 * add your own configuration down below, inside the `manualNetworks` object.
 */
const manualNetworks = {
  development: {
    provider: require("ganache-cli").provider({ gasLimit: 100000000 }),
    network_id: "*",
  },
}

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    ...supportedNetworks,
    ...manualNetworks,
  },

  // The `solc` compiler is set to optimize output bytecode with 200 runs, which is the standard these days
  compilers,

  // This plugin allows to verify the source code of your contracts on Etherscan with this command:
  // ETHERSCAN_API_KEY=<your_etherscan_api_key> truffle run verify <contract_name> --network <network_name>
  plugins: [
    "truffle-plugin-verify",
  ],

  // This is just for the `truffle-plugin-verify` to catch the API key
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
  },
}
