const hre = require("hardhat")
const { deployments } = require("hardhat")

async function main() {
  // deploy Donate
  const VRFCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock")
  vrfAddress = VRFCoordinatorV2Mock.address

  const DLottery = await hre.ethers.getContractFactory("DLottery")
  const dlottery = await DLottery.deploy(
    vrfAddress,
    "588",
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    "30",
    "100000000000000000",
    "500000"
  )

  await dlottery.deployed()

  console.log("Donate deployed to:", dlottery.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
