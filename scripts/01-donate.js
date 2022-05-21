const hre = require("hardhat")
const { deployments } = require("hardhat")

async function main() {
  // deploy Donate
  const ethUsdAggregator = await deployments.get("MockV3Aggregator")
  ethUsdPriceFeedAddress = ethUsdAggregator.address

  const Donate = await hre.ethers.getContractFactory("Donate")
  const donate = await Donate.deploy(ethUsdPriceFeedAddress)

  await donate.deployed()

  console.log("Donate deployed to:", donate.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
