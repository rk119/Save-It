const { network, deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("DLottery Unit Tests", async function () {
    let dlottery, donate, vrfCoordinatorV2Mock, interval, deployer, donation, donator1, donator2, donator3, donator4, donator5

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [ deployer, donator1, donator2, donator3, donator4 ] = [ accounts[0], accounts[1], accounts[2], accounts[3], accounts[4] ]
        await deployments.fixture(["all"])
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        dlottery = await ethers.getContract("DLottery")
        interval = await dlottery.getInterval()
        donate = await ethers.getContract("Donate")
        await dlottery.setAddress(donate.address)
        await donate.setLotteryAddress(dlottery.address)
        donation = await donate.getUsdAmountInEth(10)
        await donate.connect(donator1).donate({ value: donation })
        await donate.connect(donator2).donate({ value: donation })
        await donate.connect(donator3).donate({ value: donation })
        await donate.connect(donator4).donate({ value: donation })
    })

    describe("constructor", () => {
        it("intitiallizes dlottery correctly", async () => {
            const lotteryState = (await dlottery.getLotteryState()).toString()
            assert.equal(lotteryState, "0")
            assert.equal(interval.toString(), networkConfig[network.config.chainId]["keepersUpdateInterval"])
        })
    })

    describe("Adding of multiple foodie items", async () => {
        let numOfFoodieItems
        beforeEach(async () => {
            await dlottery.addFoodie("Sooubway: Veggie Pattie")
            await dlottery.addFoodie("Sooubway: Meatball")
            await dlottery.addFoodie("Sooubway: Steak and Cheeks")
            await dlottery.addFoodie("Sooubway: Smoked Turkey")
            numOfFoodieItems = await dlottery.getNumberOfFoodies()
        })

        it("Adds several foodies to the foodie array", async () => {
            assert.equal(numOfFoodieItems, 4)
        })
    })

    describe("checkUpkeep", () => {
        it("returns false if lottery isn't open", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1,])
            await network.provider.request({method: "evm_mine", params: [],})
            await dlottery.performUpkeep([])
            const lotteryState = await dlottery.getLotteryState()
            const { upkeepNeeded } = await dlottery.callStatic.checkUpkeep("0x")
            assert.equal(lotteryState.toString() == "1", upkeepNeeded == false)
        })

        xit("returns false if enough time hasn't passed", async () => {
            const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
            await expect(counter.performUpkeep(checkData)).to.be.revertedWith("Time interval not met")
            // await dlottery.enterLottery({ value: dlotteryEntranceFee })
            // await network.provider.send("evm_increaseTime", [
            //     interval.toNumber() - 1,
            // ])
            // await network.provider.request({
            //     method: "evm_mine",
            //     params: [],
            // })
            // const { upkeepNeeded } =
            //     await dlottery.connect(donator1).callStatic.checkUpkeep("0x")
            // assert(!upkeepNeeded)
        })

        it("returns true if enough time has passed, has players, eth, and is open", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1,])
            await network.provider.request({method: "evm_mine", params: [],})
            const { upkeepNeeded } = await dlottery.callStatic.checkUpkeep("0x")
            assert(upkeepNeeded)
        })
    })

    describe("performUpkeep", () => {
        it("can only run if checkupkeep is true", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1,])
            await network.provider.request({method: "evm_mine", params: [],})
            const tx = await dlottery.performUpkeep("0x")
            assert(tx)
        })

        it("reverts if checkup is false", async () => {
            await expect(dlottery.performUpkeep("0x")).to.be.revertedWith(
                "Lottery__UpkeepNotNeeded"
            )
        })

        it("updates the lottery state and emits a requestId", async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1,])
            await network.provider.request({method: "evm_mine", params: [],})
            const txResponse = await dlottery.performUpkeep("0x")
            const txReceipt = await txResponse.wait(1)
            const LotteryState = await dlottery.getLotteryState()
            const requestId = txReceipt.events[1].args.requestId
            assert(requestId.toNumber() > 0)
            assert(LotteryState == 1)
        })
    })

    describe("fulfillRandomWords", () => {
        beforeEach(async () => {
            await network.provider.send("evm_increaseTime", [interval.toNumber() + 1,])
            await network.provider.request({method: "evm_mine", params: [],})
        })

        it("can only be called after performupkeep", async () => {
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, dlottery.address)).to.be.revertedWith("nonexistent request")
            await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, dlottery.address)).to.be.revertedWith("nonexistent request")
        })
        
        it("picks a winner, resets, and sends money", async () => {
            const startingTimeStamp = await dlottery.getLastTimeStamp()
            await new Promise(async (resolve, reject) => {
                dlottery.once("WinnerPicked", async () => {
                    console.log("WinnerPicked event fired!")
                    try {
                        const recentWinner = await dlottery.getRecentWinner()
                        const LotteryState = await dlottery.getLotteryState()
                        const endingTimeStamp = await dlottery.getLastTimeStamp()
                        
                        assert.equal(recentWinner.toString(), donator1.address)
                        assert.equal(LotteryState, 0)
                        assert(endingTimeStamp > startingTimeStamp)
                        resolve()

                    } catch (e) {
                        reject(e)
                    }
                })

                const tx = await dlottery.performUpkeep("0x")
                const txReceipt = await tx.wait(1)
                await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, dlottery.address)
            })
        })
    })
})
