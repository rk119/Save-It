const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async () => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const donate = await ethers.getContract("Donate")
  const donateAddress = donate.address

  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS

  log("----------------------------------------------------")
  const args = [donateAddress]
  const delivery = await deploy("Delivery", {
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
    await verify(delivery.address, args)
  }

  log("Deploying...")
  log("----------------------------------------------------")
  log("Delivery deployed successfully!")

  log("----------------------------------------------------")
  await donate.setDeliveryAddress(delivery.address)
  log("Delivery connected to Donate!")
}

module.exports.tags = ["all", "delivery"]