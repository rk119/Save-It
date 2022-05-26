const { network, deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

describe("SaveIt Unit Tests", async function () {
    let saveit, vrfCoordinatorV2Mock, interval
    let deployer
    let donation, oldBalance1, donator1, donator2, donator3, donator4
    let foodDonation, foodplace1, foodplace2, foodplace3, foodplace4

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        ;[
            deployer,
            donator1,
            donator2,
            donator3,
            donator4,
            foodplace1,
            foodplace2,
            foodplace3,
            foodplace4,
        ] = [
            accounts[0],
            accounts[1],
            accounts[2],
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8],
        ]
        await deployments.fixture(["all"])
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        saveit = await ethers.getContract("SaveIt")
        interval = await saveit.getInterval()
        donation = await saveit.getUsdAmountInEth(10)
        oldBalance1 = await donator1.getBalance()
        await saveit.connect(donator1).donate({ value: donation })
        await saveit.connect(donator2).donate({ value: donation })
        await saveit.connect(donator3).donate({ value: donation })
        await saveit.connect(donator4).donate({ value: donation })
    })

    describe("constructor", () => {

        it("sets the aggregator addresses correctly", async () => {
            const response = await saveit.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })

        it("owner is deployer", async () => {
            const owner = await saveit.owner()
            assert.equal(owner, deployer.address)
        })

        it("intitiallizes SaveIt correctly", async () => {
            const lotteryState = (await saveit.getLotteryState()).toString()
            assert.equal(lotteryState, "0")
            assert.equal(
                interval.toString(),
                networkConfig[network.config.chainId]["keepersUpdateInterval"]
            )
        })
    })

    describe("deployment of SaveIt", async () => {
        it("deploys SaveIt successfully", async () => {
            const address = await saveit.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, "")
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    // donate Tests
    describe("donating", async () => {
        it("deducts eth from donator1", async () => {
            let newBalance = await donator1.getBalance()
            const exepectedBalance = oldBalance1.sub(donation)
            assert.equal(Math.round(ethers.utils.formatEther(newBalance)), Math.round(ethers.utils.formatEther(exepectedBalance)))
        })

        it("check mapping", async () => {
            let donateBalance = await saveit.getAddressToAmount(donator1.address)
            assert.equal(donateBalance.toString(), donation.toString())
            let address = await saveit.getIdToAddress(1)
            assert.equal(address, donator1.address)
        })

        it("donations and donators incremented", async () => {
            const totalDonations = await saveit.s_totalDonations()
            assert.equal(totalDonations.toNumber(), 4)
            const totalDonators = await saveit.s_totalDonators()
            assert.equal(totalDonators, 4)
        })

        it("same address makes another donation", async () => {
            let donateInitialBalance = await saveit.getAddressToAmount(donator1.address)
            let anotherDonation = await saveit.getUsdAmountInEth(20)
            await saveit.connect(donator1).donate({ value: anotherDonation })
            let donateNewBalance = await saveit.getAddressToAmount(donator1.address)

            const exepectedBalance = donateInitialBalance.add(anotherDonation)
            const totalDonations = await saveit.s_totalDonations()
            const totalDonators = await saveit.s_totalDonators()

            assert.equal(donateNewBalance.toString(), exepectedBalance.toString())
            assert.equal(totalDonations, 5)
            assert.equal(totalDonators, 4)
        })

        it("different address makes another donation", async () => {
            let donator5 = accounts[9]
            let oldBalance5 = await donator5.getBalance()
            let fifthDonation = await saveit.getUsdAmountInEth(12)
            await expect(
                saveit.connect(donator5).donate({ value: fifthDonation })
            ).to.emit(saveit, "DonationAccepted").withArgs(donator5.address, fifthDonation)

            let newBalance = await donator5.getBalance()
            const exepectedBalance = oldBalance5.sub(fifthDonation)
            assert.equal(Math.round(ethers.utils.formatEther(newBalance)), Math.round(ethers.utils.formatEther(exepectedBalance)))

            let donateBalance = await saveit.getAddressToAmount(donator5.address)
            assert.equal(donateBalance.toString(), fifthDonation.toString())
            
            let address = await saveit.getIdToAddress(5)
            assert.equal(address, donator5.address)

            const totalDonations = await saveit.s_totalDonations()
            assert.equal(totalDonations, 5)
            const totalDonators = await saveit.s_totalDonators()
            assert.equal(totalDonators, 5)
        })

        it("fails if donation amount is less than minimum", async () => {
            await expect(saveit.connect(donator1).donate({ value: await saveit.getUsdAmountInEth(8) })).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
    })

    // pickup tests

    // dlottery tests

    // describe("Adding multiple foodie items", async () => {
    //     let numOfFoodieItems
    //     beforeEach(async () => {
    //         await saveit.addFoodie("Sooubway: Veggie Pattie")
    //         await saveit.addFoodie("Sooubway: Meatball")
    //         await saveit.addFoodie("Sooubway: Steak and Cheeks")
    //         await saveit.addFoodie("Sooubway: Smoked Turkey")
    //         numOfFoodieItems = await saveit.getNumberOfFoodies()
    //     })
    //     it("Adds several foodies to the foodie array", async () => {
    //         assert.equal(numOfFoodieItems, 4)
    //     })
    // })

    // describe("checkUpkeep", () => {
    //     it("returns false if lottery isn't open", async () => {
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() + 1,
    //         ])
    //         await network.provider.request({ method: "evm_mine", params: [] })
    //         await saveit.performUpkeep([])
    //         const lotteryState = await saveit.getLotteryState()
    //         const { upkeepNeeded } = await saveit.callStatic.checkUpkeep("0x")
    //         assert.equal(lotteryState.toString() == "1", upkeepNeeded == false)
    //     })

    //     xit("returns false if enough time hasn't passed", async () => {
    //         const checkData = ethers.utils.keccak256(
    //             ethers.utils.toUtf8Bytes("")
    //         )
    //         await expect(saveit.performUpkeep(checkData)).to.be.revertedWith(
    //             "Lottery__UpkeepNotNeeded"
    //         )
    //         // await saveit.enterLottery({ value: donation })
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() - 1,
    //         ])
    //         await network.provider.request({method: "evm_mine", params: [],})
    //         const { upkeepNeeded } =
    //             await saveit.connect(donator1).callStatic.checkUpkeep("0x")
    //         assert.equal(upkeepNeeded, false)
    //     })

    //     it("returns true if enough time has passed, has players, eth, and is open", async () => {
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() + 1,
    //         ])
    //         await network.provider.request({ method: "evm_mine", params: [] })
    //         const { upkeepNeeded } = await saveit.callStatic.checkUpkeep("0x")
    //         assert(upkeepNeeded)
    //     })
    // })

    // describe("performUpkeep", () => {
    //     it("can only run if checkupkeep is true", async () => {
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() + 1,
    //         ])
    //         await network.provider.request({ method: "evm_mine", params: [] })
    //         const tx = await saveit.performUpkeep("0x")
    //         assert(tx)
    //     })

    //     it("reverts if checkup is false", async () => {
    //         await expect(saveit.performUpkeep("0x")).to.be.revertedWith(
    //             "Lottery__UpkeepNotNeeded"
    //         )
    //     })

    //     it("updates the lottery state and emits a requestId", async () => {
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() + 1,
    //         ])
    //         await network.provider.request({ method: "evm_mine", params: [] })
    //         const txResponse = await saveit.performUpkeep("0x")
    //         const txReceipt = await txResponse.wait(1)
    //         const LotteryState = await saveit.getLotteryState()
    //         const requestId = txReceipt.events[1].args.requestId
    //         assert(requestId.toNumber() > 0)
    //         assert(LotteryState == 1)
    //     })
    // })

    // describe("fulfillRandomWords", () => {
    //     beforeEach(async () => {
    //         await network.provider.send("evm_increaseTime", [
    //             interval.toNumber() + 1,
    //         ])
    //         await network.provider.request({ method: "evm_mine", params: [] })
    //     })

    //     it("can only be called after performupkeep", async () => {
    //         await expect(
    //             vrfCoordinatorV2Mock.fulfillRandomWords(0, saveit.address)
    //         ).to.be.revertedWith("nonexistent request")
    //         await expect(
    //             vrfCoordinatorV2Mock.fulfillRandomWords(1, saveit.address)
    //         ).to.be.revertedWith("nonexistent request")
    //     })

    //     it("picks a winner, resets, and sends money", async () => {
    //         const startingTimeStamp = await saveit.getLastTimeStamp()
    //         await new Promise(async (resolve, reject) => {
    //             saveit.once("WinnerPicked", async () => {
    //                 console.log("WinnerPicked event fired!")
    //                 try {
    //                     const recentWinner = await saveit.getRecentWinner()
    //                     const LotteryState = await saveit.getLotteryState()
    //                     const endingTimeStamp = await saveit.getLastTimeStamp()
    //                     assert.equal(recentWinner.toString(), donator1.address)
    //                     assert.equal(LotteryState, 0)
    //                     assert(endingTimeStamp > startingTimeStamp)
    //                     resolve()
    //                 } catch (e) {
    //                     reject(e)
    //                 }
    //             })
    //             const tx = await saveit.performUpkeep("0x")
    //             const txReceipt = await tx.wait(1)
    //             await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId,saveit.address)
    //         })
    //     })
    // })

    // describe("fake test", () => { 
    //     it("picks a winner", async () => { 
    //         await saveit.pickAWinner()
    //         const recentWinner = await saveit.getRecentWinner()
    //         assert.equal(recentWinner.toString(), donator1.address)
    //     })
    // })
})
