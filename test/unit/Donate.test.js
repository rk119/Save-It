/* eslint-disable jest/valid-expect */
const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("Donate Unit Tests", function () {
  let mockV3Aggregator, donate, converter;
  let deployer, accounts;
  let donation, oldBalance1, donator1, donator2, donator3, donator4;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, donator1, donator2, donator3, donator4] = [
      accounts[0],
      accounts[1],
      accounts[2],
      accounts[3],
      accounts[4],
    ];

    await deployments.fixture(["all"]);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
    converter = await ethers.getContract("Converter");
    donate = await ethers.getContract("Donate");
    donation = await converter.usdToETH(10);
    oldBalance1 = await donator1.getBalance();

    await donate.connect(donator1).donate({ value: donation });
    await donate.connect(donator2).donate({ value: donation });
    await donate.connect(donator3).donate({ value: donation });
    await donate.connect(donator4).donate({ value: donation });
  });

  describe("constructor", () => {
    it("sets the aggregator address correctly", async () => {
      const response = await converter.s_priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });

    it("sets the converter address correctly", async () => {
      const response = await donate.s_converter();
      assert.equal(response, converter.address);
    });

    it("owner is deployer", async () => {
      const owner = await donate.owner();
      assert.equal(owner, deployer.address);
    });
  });

  describe("donate", () => {
    it("deducts ETH from donator1", async () => {
      const newBalance = await donator1.getBalance();
      const exepectedBalance = oldBalance1.sub(donation);
      const newBalanceValue = Math.round(ethers.utils.formatEther(newBalance));
      const exepectedBalanceValue = Math.round(
        ethers.utils.formatEther(exepectedBalance)
      );
      assert.equal(newBalanceValue, exepectedBalanceValue);
    });

    it("fails if donation amount is less than minimum", async () => {
      await expect(
        donate.connect(donator1).donate({ value: await converter.usdToETH(8) })
      ).to.be.revertedWith("You need to spend more ETH!");
    });
  });

  describe("getDonator", () => {
    it("returns the correct donator from the given index", async () => {
      const first_donator = await donate.getDonator(0);
      const last_donator = await donate.getDonator(3);
      assert.equal(first_donator, donator1.address);
      assert.equal(last_donator, donator4.address);
    });
  });

  describe("getDonators", () => {
    it("increments the number of donators", async () => {
      const totalDonators = await donate.getDonators();
      assert.equal(totalDonators, 4);
    });
  });
});
