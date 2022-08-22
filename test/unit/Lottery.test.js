/* eslint-disable jest/valid-expect */
const { deployments, network, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { networkConfig } = require("../../helper-hardhat-config");

describe("Lottery Unit Tests", function () {
  let converter, donate, lottery, vrfCoordinatorV2Mock;

  let interval, accounts, donation; // , deployer
  let donator1, donator2, donator3, donator4;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [donator1, donator2, donator3, donator4] = [
      accounts[1],
      accounts[2],
      accounts[3],
      accounts[4],
    ];
    await deployments.fixture(["all"]);
    converter = await ethers.getContract("Converter");
    donate = await ethers.getContract("Donate");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    lottery = await ethers.getContract("Lottery");
    donation = await converter.usdToETH(10);
    interval = await lottery.getInterval();

    await donate.connect(donator1).donate({ value: donation });
    await donate.connect(donator2).donate({ value: donation });
    await donate.connect(donator3).donate({ value: donation });
    await donate.connect(donator4).donate({ value: donation });
  });

  describe("constructor", () => {
    it("intitiallizes the lottery correctly", async () => {
      const lotteryState = (await lottery.getLotteryState()).toString();
      assert.equal(lotteryState, "0");
      assert.equal(
        interval.toString(),
        networkConfig[network.config.chainId]["keepersUpdateInterval"]
      );
    });
  });

  describe("checkUpkeep", () => {
    it("returns false if lottery isn't open", async () => {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await lottery.performUpkeep([]);
      const lotteryState = await lottery.getLotteryState();
      const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
      assert.equal(lotteryState.toString() === "1", upkeepNeeded === false);
    });
    it("returns true if enough time has passed and is open", async () => {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const { upkeepNeeded } = await lottery.callStatic.checkUpkeep("0x");
      assert(upkeepNeeded);
    });
  });

  describe("performUpkeep", () => {
    it("can only run if checkupkeep is true", async () => {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const tx = await lottery.performUpkeep("0x");
      assert(tx);
    });
    it("reverts if checkup is false", async () => {
      await expect(lottery.performUpkeep("0x")).to.be.revertedWith(
        "Lottery__UpkeepNotNeeded"
      );
    });
    it("updates the lottery state and emits a requestId", async () => {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const txResponse = await lottery.performUpkeep("0x"); // emits requestId
      const txReceipt = await txResponse.wait(1); // waits 1 block
      const lotteryState = await lottery.getLotteryState(); // updates state
      const requestId = txReceipt.events[1].args.requestId;
      assert(requestId.toNumber() > 0);
      assert(lotteryState === 1); // 0 = open, 1 = calculating
    });
  });

  describe("fulfillRandomWords", () => {
    beforeEach(async () => {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
    });
    it("can only be called after performupkeep", async () => {
      await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address) // reverts if not fulfilled
      ).to.be.revertedWith("nonexistent request");
      await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address) // reverts if not fulfilled
      ).to.be.revertedWith("nonexistent request");
    });

    it("picks a winner, resets, and sends money", async () => {
      const startingTimeStamp = await lottery.getLastTimeStamp();

      await new Promise(async (resolve, reject) => {
        lottery.once("WinnerPicked", async () => {
          console.log("WinnerPicked event fired!");
          try {
            const recentWinner = await lottery.getRecentWinner();
            const lotteryState = await lottery.getLotteryState();
            const endingTimeStamp = await lottery.getLastTimeStamp();
            assert.equal(recentWinner.toString(), accounts[2].address);
            assert.equal(lotteryState, 0);
            assert(endingTimeStamp > startingTimeStamp);
            resolve(); // if try passes, resolves the promise
          } catch (e) {
            reject(e); // if try fails, rejects the promise
          }
        });

        const tx = await lottery.performUpkeep("0x");
        const txReceipt = await tx.wait(1);
        await vrfCoordinatorV2Mock.fulfillRandomWords(
          txReceipt.events[1].args.requestId,
          lottery.address
        );
      });
    });
  });
});
