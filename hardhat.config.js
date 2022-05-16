/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-truffle5");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
  },

  solidity: {
    version: "0.8.7"
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
