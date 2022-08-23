const { hre, ethers } = require("hardhat")

async function main() {
  // deploy MockV3Aggregator
  const MockV3Aggregator = await hre.ethers.getContractFactory(
    "MockV3Aggregator"
  )
  const mockV3Aggregator = await MockV3Aggregator.deploy("18", "200000000000")
  await mockV3Aggregator.deployed()
  console.log("MockV3Aggregator deployed to:", mockV3Aggregator.address)

  // // deploy VRFCoordinatorV2Mock
  const VRFCoordinatorV2Mock = await hre.ethers.getContractFactory(
    "VRFCoordinatorV2Mock"
  )
  const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(
    "100000000000000000",
    1e9
  )
  await vrfCoordinatorV2Mock.deployed()
  console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorV2Mock.address)

  // deploy Converter
  const Converter = await hre.ethers.getContractFactory("Converter")
  const converter = await Converter.deploy(mockV3Aggregator.address)
  console.log("Converter deployed to:", converter.address)

  // deploy Donate
  const Donate = await hre.ethers.getContractFactory("Donate")
  const donate = await Donate.deploy(converter.address)
  console.log("Donate deployed to:", donate.address)

  // deploy Delivery
  const Delivery = await hre.ethers.getContractFactory("Delivery")
  const delivery = await Delivery.deploy(donate.address)
  console.log("Delivery deployed to:", delivery.address)

  const donateContract = await ethers.getContract("Donate")
  await donateContract.setDeliveryAddress(delivery.address)
  console.log("Delivery has been connected to Donate")

  // deploy Lottery
  const Lottery = await hre.ethers.getContractFactory("Lottery")
  const lottery = await Lottery.deploy(
    vrfCoordinatorV2Mock.address,
    "588",
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    "30",
    "500000",
    donate.address
  )
  await lottery.deployed()
  console.log("Lottery deployed to:", lottery.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
