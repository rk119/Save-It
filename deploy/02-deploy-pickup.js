const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async () => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying PickUp...")
        const pickup = await deploy("PickUp", {
            contract: "PickUp",
            from: deployer,
            log: true,
            args: [],
        })

        // Verify the deployment
        if (
            !developmentChains.includes(network.name) &&
            process.env.ETHERSCAN_API_KEY
        ) {
            log("Verifying...")
            await verify(pickup.address, arguments)
        }
        log(`PickUp deployed at ${pickup.address}`)
    }
}
module.exports.tags = ["pickup"]
