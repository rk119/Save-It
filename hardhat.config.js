/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("solidity-coverage")
require("hardhat-deploy")
require("@nomiclabs/hardhat-waffle")
require("dotenv").config()

const ALCHEMY_API_KEY = "HzxX9UmdDhnM8UYPlS3tcDysi5MCKFaR"

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const RINKEBY_PRIVATE_KEY =
    "0xca394caca4c42ed4372e2efb39b371f30abb1b30a86b943b2c2f8752d5602a20"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`],
      // chainId: 4,
      // saveDeployments: true
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};
