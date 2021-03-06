const hre = require("hardhat")
const { deployments } = require("hardhat")

async function main() {
    // uncomment these lines to deploy to the hardhat local network

    // deploy MockV3Aggregator
    // const MockV3Aggregator = await hre.ethers.getContractFactory(
    //   "MockV3Aggregator"
    // )
    // const mockV3Aggregator = await MockV3Aggregator.deploy(
    //   "18",
    //   "200000000000000000000"
    // )
    // await mockV3Aggregator.deployed()
    // console.log("MockV3Aggregator deployed to:", mockV3Aggregator.address)

    // // deploy VRFCoordinatorV2Mock
    // const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory("VRFCoordinatorV2Mock")
    // const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy("100000000000000000", 1e9)
    // await vrfCoordinatorV2Mock.deployed()
    // console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorV2Mock.address)

    // deploy SaveIt
    // const vrfCoordinatorV2 = await deployments.get("VRFCoordinatorV2Mock")
    // vrfAddress = vrfCoordinatorV2.address
    vrfAddress = "0xf92479E7183e35c97E372F3a094F415f414CCe07" // << and commment these lines
    // const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    // ethUsdPriceFeedAddress = ethUsdAggregator.address
    ethUsdPriceFeedAddress = "0x19ed2E3236D017170Ccc8DD9062E3E65318951B0" // <<
    const SaveIt = await hre.ethers.getContractFactory("SaveIt")
    const saveit = await SaveIt.deploy(
        vrfAddress,
        "588",
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        "30",
        "100000000000000000",
        "500000",
        ethUsdPriceFeedAddress
    )
    await saveit.deployed()
    console.log("SaveIt deployed to:", saveit.address)
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error)
  process.exit(1)
})

