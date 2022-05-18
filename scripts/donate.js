const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const donate = await ethers.getContract("Donate", deployer)
  console.log(`Got contract Donate at ${donate.address}`)
  console.log("Donating to contract...")
  const transactionResponse = await donate.donate({
    value: ethers.utils.parseEther("0.0055"),
  })
  await transactionResponse.wait()
  console.log("Donated!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })