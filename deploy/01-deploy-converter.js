const { getNamedAccounts, deployments, network } = require("hardhat")
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async () => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress
  if (chainId === 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  log("----------------------------------------------------")
  const args = [ethUsdPriceFeedAddress]
  const converter = await deploy("Converter", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  })

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...")
    await verify(converter.address, args)
  }

  log("Deploying...")
  log("----------------------------------------------------")
  log("Converter deployed successfully!")
}

module.exports.tags = ["all", "converter"]
