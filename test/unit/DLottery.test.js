const { network, deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("DLottery Unit Tests", async function () {
    let dlottery,
        dlotteryContract,
        vrfCoordinatorV2Mock,
        dlotteryEntranceFee,
        interval,
        player // , deployer

    beforeEach(async () => {
        accounts = await ethers.getSigners() // could also do with getNamedAccounts
        //   deployer = accounts[0]
        player = accounts[1]
        await deployments.fixture(["mocks", "dlottery"])
        vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        )
        dlotteryContract = await ethers.getContract("DLottery")
        dlottery = dlotteryContract.connect(player)
        dlotteryEntranceFee = await dlottery.getEntranceFee()
        interval = await dlottery.getInterval()
    })

    describe("constructor", () => {
        it("intitiallizes dlottery correctly", async () => {
            // Ideally, we'd separate these out so that only 1 assert per "it" block
            // And ideally, we'd make this check everything
            const lotteryState = (
                await dlottery.getLotteryState()
            ).toString()
            assert.equal(lotteryState, "0")
            assert.equal(
                interval.toString(),
                networkConfig[network.config.chainId][
                "keepersUpdateInterval"
                ]
            )
        })
    })
//     describe("Adding of multiple foodie items", async () => {
//         let numOfFoodieItems
//         beforeEach(async () => {
//             await dlottery.addFoodie("Sooubway: Veggie Pattie")
//             await dlottery.addFoodie("Sooubway: Meatball")
//             await dlottery.addFoodie("Sooubway: Steak and Cheeks")
//             await dlottery.addFoodie("Sooubway: Smoked Turkey")
//             numOfFoodieItems = await dlottery.getNumberOfFoodies()
//         })
//         it("Adds several foodies to the foodie array", async () => {
//             assert.equal(numOfFoodieItems, 4)
//         })
    })
//     describe("enterLottery", () => {
//         it("reverts when you don't pay enough", async () => {
//             await expect(dlottery.enterLottery()).to.be.revertedWith(
//                 "Lottery__SendMoreToEnterLottery"
//             )
//         })
//         it("records player when they enter", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             const contractPlayer = await dlottery.getDonator(0)
//             assert.equal(player.address, contractPlayer)
//         })
//         it("emits event on enter", async () => {
//             await expect(
//                 dlottery.enterLottery({ value: dlotteryEntranceFee })
//             ).to.emit(dlottery, "LotteryEnter")
//         })
//         it("doesn't allow entrance when lottery is calculating", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             // we pretend to be a keeper for a second
//             await dlottery.performUpkeep([])
//             await expect(
//                 dlottery.enterLottery({ value: dlotteryEntranceFee })
//             ).to.be.revertedWith("Lottery__LotteryNotOpen")
//         })
//     })
//     describe("checkUpkeep", () => {
//         it("returns false if people haven't sent any ETH", async () => {
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             const { upkeepNeeded } =
//                 await dlottery.callStatic.checkUpkeep("0x")
//             assert(!upkeepNeeded)
//         })
//         it("returns false if lottery isn't open", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             await dlottery.performUpkeep([])
//             const lotteryState = await dlottery.getLotteryState()
//             const { upkeepNeeded } =
//                 await dlottery.callStatic.checkUpkeep("0x")
//             assert.equal(
//                 lotteryState.toString() == "1",
//                 upkeepNeeded == false
//             )
//         })
//         it("returns false if enough time hasn't passed", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() - 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             const { upkeepNeeded } =
//                 await dlottery.callStatic.checkUpkeep("0x")
//             assert(!upkeepNeeded)
//         })
//         it("returns true if enough time has passed, has players, eth, and is open", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             const { upkeepNeeded } =
//                 await dlottery.callStatic.checkUpkeep("0x")
//             assert(upkeepNeeded)
//         })
//     })

//     describe("performUpkeep", () => {
//         it("can only run if checkupkeep is true", async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             const tx = await dlottery.performUpkeep("0x")
//             assert(tx)
//         })
//         it("reverts if checkup is false", async () => {
//             await expect(dlottery.performUpkeep("0x")).to.be.revertedWith(
//                 "Lottery__UpkeepNotNeeded"
//             )
//         })
//         it("updates the lottery state and emits a requestId", async () => {
//             // Too many asserts in this test!
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//             const txResponse = await dlottery.performUpkeep("0x")
//             const txReceipt = await txResponse.wait(1)
//             const LotteryState = await dlottery.getLotteryState()
//             const requestId = txReceipt.events[1].args.requestId
//             assert(requestId.toNumber() > 0)
//             assert(LotteryState == 1)
//         })
//     })
//     describe("fulfillRandomWords", () => {
//         beforeEach(async () => {
//             await dlottery.enterLottery({ value: dlotteryEntranceFee })
//             await network.provider.send("evm_increaseTime", [
//                 interval.toNumber() + 1,
//             ])
//             await network.provider.request({
//                 method: "evm_mine",
//                 params: [],
//             })
//         })
//         it("can only be called after performupkeep", async () => {
//             await expect(
//                 vrfCoordinatorV2Mock.fulfillRandomWords(
//                     0,
//                     dlottery.address
//                 )
//             ).to.be.revertedWith("nonexistent request")
//             await expect(
//                 vrfCoordinatorV2Mock.fulfillRandomWords(
//                     1,
//                     dlottery.address
//                 )
//             ).to.be.revertedWith("nonexistent request")
//         })
//         // This test is too big...
//         it("picks a winner, resets, and sends money", async () => {
//             const additionalEntrances = 3
//             const startingIndex = 2
//             for (
//                 let i = startingIndex;
//                 i < startingIndex + additionalEntrances;
//                 i++
//             ) {
//                 dlottery = dlotteryContract.connect(accounts[i])
//                 await dlottery.enterLottery({
//                     value: dlotteryEntranceFee,
//                 })
//             }
//             const startingTimeStamp = await dlottery.getLastTimeStamp()

//             // This will be more important for our staging tests...
//             await new Promise(async (resolve, reject) => {
//                 dlottery.once("WinnerPicked", async () => {
//                     console.log("WinnerPicked event fired!")
//                     // assert throws an error if it fails, so we need to wrap
//                     // it in a try/catch so that the promise returns event
//                     // if it fails.
//                     try {
//                         // Now lets get the ending values...
//                         const recentWinner =
//                             await dlottery.getRecentWinner()
//                         const LotteryState =
//                             await dlottery.getLotteryState()
//                         const winnerBalance =
//                             await accounts[2].getBalance()
//                         const endingTimeStamp =
//                             await dlottery.getLastTimeStamp()
//                         await expect(dlottery.getDonator(0)).to.be
//                             .reverted
//                         assert.equal(
//                             recentWinner.toString(),
//                             accounts[2].address
//                         )
//                         assert.equal(LotteryState, 0)
//                         assert.equal(
//                             winnerBalance.toString(),
//                             startingBalance
//                                 .add(
//                                     dlotteryEntranceFee
//                                         .mul(additionalEntrances)
//                                         .add(dlotteryEntranceFee)
//                                 )
//                                 .toString()
//                         )
//                         assert(endingTimeStamp > startingTimeStamp)
//                         resolve()
//                     } catch (e) {
//                         reject(e)
//                     }
//                 })

//                 const tx = await dlottery.performUpkeep("0x")
//                 const txReceipt = await tx.wait(1)
//                 const startingBalance = await accounts[2].getBalance()
//                 await vrfCoordinatorV2Mock.fulfillRandomWords(
//                     txReceipt.events[1].args.requestId,
//                     dlottery.address
//                 )
//             })
//         })
//     })
// })
