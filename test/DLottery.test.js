const { deployments, ethers, network } = require("hardhat");
const { assert, AssertionError } = require("chai");

const DLottery = artifacts.require("DLottery.sol");
const VRFCoordinatorV2Mock = artifacts.require("VRFCoordinatorV2Mock.sol");

require("chai").use(require("chai-as-promised")).should();

describe("DLottery contract", function () {
    let accounts, dlottery, interval, vrfCoordinatorV2Mock;

    before(async function () {
        accounts = await web3.eth.getAccounts();
        [deployer, donator1, donator2, donator3, donator4] = accounts;
        await deployments.fixture(["mocks", "dlottery"]);
        vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.new(
            "500000",
            "500000"
        );
        dlottery = await DLottery.new(
            "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
            "3499",
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            "500000"
        );
        interval = await dlottery.getInterval();
    });

    // test the deployment of the PickUp contract
    describe("Deployment of DLottery", async () => {
        it("Deploys DLottery successfully", async () => {
            const address = await dlottery.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, "");
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
        it("It has a name", async () => {
            const name = await dlottery.name();
            assert.equal(name, "DLottery");
        });
    });

    // test the appending of multiple new foodie items
    describe("Adding of multiple foodie items", async () => {
        let result1, result2, result3, result4, numOfFoodieItems;
        beforeEach(async () => {
            result1 = await dlottery.addFoodie("Sooubway: Veggie Pattie");
            result2 = await dlottery.addFoodie("Sooubway: Meatball");
            result3 = await dlottery.addFoodie("Sooubway: Steak and Cheeks");
            result4 = await dlottery.addFoodie("Sooubway: Smoked Turkey");
            numOfFoodieItems = await dlottery.getNumberOfFoodies();
        });
        it("Adds several foodies to the foodie array", async () => {
            assert.equal(numOfFoodieItems, 4);
            const event1 = result1.logs[0].args;
            const event2 = result2.logs[0].args;
            const event3 = result3.logs[0].args;
            const event4 = result4.logs[0].args;
            assert.equal(
                event1.food,
                "Sooubway: Veggie Pattie",
                "the food is correct"
            );
            assert.equal(
                event2.food,
                "Sooubway: Meatball",
                "the food is correct"
            );
            assert.equal(
                event3.food,
                "Sooubway: Steak and Cheeks",
                "the food is correct"
            );
            assert.equal(
                event4.food,
                "Sooubway: Smoked Turkey",
                "the food is correct"
            );
        });
    });

    describe("Enter the lottery", async () => {
        it("records donator when they donate", async () => {
            await dlottery.fund(10, { from: donator1 });
            await dlottery.fund(10, { from: donator2 });
            const numOfDonators = await dlottery.getNumberOfDonators();
            assert.equal(numOfDonators, 2);
        });
    });

    describe("checkUpkeep", () => {
        it("returns false if enough time hasn't passed", async () => {
            await dlottery.fund(10, { from: donator1 });
            await network.provider.send("evm_increaseTime", [
                interval.toNumber() - 100,
            ]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const { upkeepNeeded } = await dlottery.checkUpkeep("0x");
            assert(!upkeepNeeded);
        });
        it("returns true if enough time has passed, has donators", async () => {
            await dlottery.fund(10, { from: donator1 });
            await network.provider.send("evm_increaseTime", [
                interval.toNumber() + 100,
            ]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const { upkeepNeeded } = await dlottery.checkUpkeep("0x");
            assert(upkeepNeeded);
        });
    });

    describe("performUpkeep", () => {
        it("can only run if checkUpkeep is true", async () => {
            await dlottery.fund(10, { from: donator1 });
            await network.provider.send("evm_increaseTime", [
                interval.toNumber() + 100,
            ]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const { tx } = await dlottery.performUpkeep("0x");
            assert(tx);
        });
        it("rejects if checkUpkeep is false", async () => {
            await expect(dlottery.performUpkeep("0x")).to.be.rejected;
        });
        it("updates the lottery state and emits a requestId", async () => {
            await dlottery.fund(10, { from: donator1 });
            await network.provider.send("evm_increaseTime", [
                interval.toNumber() + 100,
            ]);
            await network.provider.request({ method: "evm_mine", params: [] });
            const txResponse = await dlottery.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            const lotteryState = await dlottery.getLotteryState();
            const requestId = txReceipt.events[1].args.requestId;
            assert(requestId.toNumber() > 0);
            assert(lotteryState == 1);
        });
    });

    describe("fulfillRandomWords", () => {
        beforeEach(async () => {
            await dlottery.fund(10, { from: donator1 });
            await network.provider.send("evm_increaseTime", [
                interval.toNumber() + 100,
            ]);
            await network.provider.request({ method: "evm_mine", params: [] });
            dlottery.setInterval(5);
        });
        it("can only be called after performUpkeep", async () => {
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(0, dlottery.address)
            ).to.be.rejected;
            await expect(
                vrfCoordinatorV2Mock.fulfillRandomWords(1, dlottery.address)
            ).to.be.rejected;
        });
        xit("picks a winner, resets, and sends money", async () => {
            const extra = 3;
            const start_i = 1;
            for (let i = start_i; i < start_i + extra; i++) {
                await dlottery.fund(10, { from: accounts[i] });
            }
            const start = await dlottery.getLastTimeStamp();
            await new Promise(async (resolve, reject) => {
                dlottery.once("WinnerPicked", async () => {
                    console.log("WinnerPicked event fired!");
                    try {
                        const recentWinner = await dlottery.getPreviousWinner();
                        const lotteryState = await dlottery.getLotteryState();
                        const end = await dlottery.getLastTimeStamp();
                        await expect(dlottery.getDonator(0)).to.be.rejected;
                        assert.equal(recentWinner.toString(), accounts[2]);
                        assert.equal(lotteryState, 0);
                        assert(end > start);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
                const tx = await dlottery.performUpkeep("0x");
                const txReceipt = await tx.wait(1);
                await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId, dlottery.address);
            });
        });
    });
});