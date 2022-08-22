/* eslint-disable jest/valid-expect */
const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("Delivery Unit Tests", function () {
  let converter, donate, delivery;
  let deployer, accounts;
  let donation, donator1, donator2, donator3, donator4;
  let foodplace1, foodplace2;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, donator1, donator2, donator3, donator4] = [
      accounts[0],
      accounts[1],
      accounts[2],
      accounts[3],
      accounts[4],
    ];
    [foodplace1, foodplace2] = [accounts[5], accounts[6]];

    await deployments.fixture(["all"]);
    converter = await ethers.getContract("Converter");
    donate = await ethers.getContract("Donate");
    delivery = await ethers.getContract("Delivery");
    await donate.setDeliveryAddress(delivery.address);
    donation = await converter.usdToETH(10);

    await donate.connect(donator1).donate({ value: donation });
    await donate.connect(donator2).donate({ value: donation });
    await donate.connect(donator3).donate({ value: donation });
    await donate.connect(donator4).donate({ value: donation });
  });

  describe("constructor", () => {
    it("sets the donate address correctly", async () => {
      const response = await delivery.s_donate();
      assert.equal(response, donate.address);
    });

    it("owner is deployer", async () => {
      const owner = await donate.owner();
      assert.equal(owner, deployer.address);
    });
  });

  describe("requestDelivery", () => {
    beforeEach(async () => {
      await delivery.connect(foodplace1).requestDelivery(30);
    });
    it("donates food for delivery", async () => {
      const amount = await delivery.getFoodDonation(foodplace1.address);
      assert.equal(amount, 30);
    });

    it("fails if donation amount is less than minimum", async () => {
      await expect(
        delivery.connect(foodplace1).requestDelivery(3)
      ).to.be.revertedWith("You need to donate more food!");
    });
  });

  describe("fundDelivery", () => {
    let oldBalance, newBalance;
    beforeEach(async () => {
      oldBalance = await ethers.provider.getBalance(donate.address);
      await delivery.connect(foodplace1).requestDelivery(30);
    });
    it("funds the delivery", async () => {
      newBalance = await ethers.provider.getBalance(donate.address);
      assert.notEqual(oldBalance, newBalance);
      assert.equal(newBalance.toString(), "7500000000000000");
    });
  });

  describe("getFoodonor", () => {
    beforeEach(async () => {
      await delivery.connect(foodplace1).requestDelivery(30);
      await delivery.connect(foodplace2).requestDelivery(45);
    });
    it("returns the correct foodonor from the given index", async () => {
      const first_donator = await delivery.getFoodonor(0);
      const last_donator = await delivery.getFoodonor(1);
      assert.equal(first_donator, foodplace1.address);
      assert.equal(last_donator, foodplace2.address);
    });
  });

  describe("getFoodonors", () => {
    beforeEach(async () => {
      await delivery.connect(foodplace1).requestDelivery(30);
      await delivery.connect(foodplace2).requestDelivery(45);
    });
    it("increments the number of foodonors", async () => {
      const totalDonators = await delivery.getFoodonors();
      assert.equal(totalDonators, 2);
    });
  });
});
