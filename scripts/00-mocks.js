const hre = require("hardhat")

async function main() {

  // deploy MockV3Aggregator
  const MockV3Aggregator = await hre.ethers.getContractFactory(
    "MockV3Aggregator"
  )
  const mockV3Aggregator = await MockV3Aggregator.deploy(
    "18",
    "200000000000000000000"
  )
  await mockV3Aggregator.deployed()
  console.log("MockV3Aggregator deployed to:", mockV3Aggregator.address)

  // deploy VRFCoordinatorV2Mock
  const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory(
    "VRFCoordinatorV2Mock"
  )
  const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
    "100000000000000000",
    1e9
  )
  await vrfCoordinatorV2Mock.deployed()
  console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorV2Mock.address)
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error)
  process.exit(1)
})
