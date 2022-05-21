const hre = require("hardhat")

async function main() {
  // deploy PickUp

  const PickUp = await hre.ethers.getContractFactory("PickUp")
  const pickup = await PickUp.deploy()

  await pickup.deployed()

  console.log("Donate deployed to:", pickup.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
