const { getNamedAccounts, deployments, network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let converterAddress;
  if (chainId === 31337) {
    const converter = await deployments.get("Converter");
    converterAddress = converter.address;
  } else {
    converterAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const args = [converterAddress];
  const donate = await deploy("Donate", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(donate.address, args);
  }

  log("Deploying...");
  log("----------------------------------------------------");
  log("Donate deployed successfully!");
};

module.exports.tags = ["all", "donate"];
