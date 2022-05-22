const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")

describe("PickUp", async () => {
    let pickup, deployer, fp1, fp2, fp3, fp4 // fp = food place

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [deployer, fp1, fp2, fp3, fp4, d1, d2, d3] = [
            accounts[0],
            accounts[1],
            accounts[2],
            accounts[3],
            accounts[4],
            accounts[5],
            accounts[6],
            accounts[7],
        ]
        await deployments.fixture(["pickup"])
        pickup = await ethers.getContract("PickUp")
    })

    describe("constructor", async () => {
        let address = pickup.address
        it("deploys PickUp successfully", async () => {
            assert.notEqual(address, 0x0)
            assert.notEqual(address, "")
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe("registering a single new food place", async () => {
        let numOfFoodPlaces
        beforeEach(async () => {
            await pickup.connect(fp1).requestDelivery(30)
            numOfFoodPlaces = await pickup.numOfFoodPlaces()
        })
        it("registers a food place", async () => {
            assert.equal(numOfFoodPlaces, 1)
        })
        // SUCCESS: parameters are valid
        it("should be successful when params are valid", async () => {
            await expect(pickup.connect(fp1).requestDelivery(22))
            .to.emit(pickup, "NewRequest").withArgs(fp1.address, 22, 2)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(301))
            .to.be.revertedWith("Invalid. Specified food amount can not be transported")
        })
    })

    describe("registering multiple new food places", async () => {
        let numOfFoodPlaces
        beforeEach(async () => {
            await pickup.connect(fp1).requestDelivery(29)
            await pickup.connect(fp2).requestDelivery(69)
            await pickup.connect(fp3).requestDelivery(45)
            await pickup.connect(fp4).requestDelivery(32)
            numOfFoodPlaces = await pickup.numOfFoodPlaces()
        })
        it("registers multiple food places", async () => {
            assert.equal(numOfFoodPlaces, 4)
        })
        // SUCCESS: parameters are valid
        it("should be successful when params are valid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(22))
            .to.emit(pickup, "NewRequest").withArgs(fp2.address, 22, 5)
            await expect(pickup.connect(fp3).requestDelivery(43))
            .to.emit(pickup, "NewRequest").withArgs(fp3.address, 43, 6)
            await expect(pickup.connect(fp4).requestDelivery(39))
            .to.emit(pickup, "NewRequest").withArgs(fp4.address, 39, 7)
            await expect(pickup.connect(fp2).requestDelivery(32))
            .to.emit(pickup, "NewRequest").withArgs(fp2.address, 32, 8)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(420))
            .to.be.revertedWith("Invalid. Specified food amount can not be transported")
        })
    })

    describe("request a new food delivery", async () => {
        let numOfFoodPlaces, numOfRequests
        beforeEach(async () => {
            await pickup.connect(fp1).requestDelivery(17)
            numOfFoodPlaces = await pickup.numOfFoodPlaces()
            numOfRequests = await pickup.numOfRequests()
        })
        it("registers a food place", async () => {
            assert.equal(numOfFoodPlaces, 1)
        })
        it("it appends a new delivery request", async () => {
            assert.equal(numOfRequests, 1)
        })
        // SUCCESS: parameters are valid
        it("should be successful when params are valid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(22))
            .to.emit(pickup, "NewRequest").withArgs(fp2.address, 22, 2)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(500))
            .to.be.revertedWith("Invalid. Specified food amount can not be transported")
            await expect(pickup.connect(fp3).requestDelivery(0))
            .to.be.revertedWith("Invalid. Specified food amount can not be transported")
        })
    })

    // // test the appending of a new delivery request
    describe("Funding of a delivery", async () => {
        let donate, donation, donationAmount, mockV3Aggregator
        beforeEach(async () => {
            await deployments.fixture(["all"])
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
            donate = await ethers.getContract("Donate")
            pickup.setAddress(donate.address)
            donate.setAddress(pickup.address)
            donation = await donate.getUsdAmountInEth(10)
            // register 3 different donators
            await donate.connect(d1).registerDonator('RifRof', '25.197197', '55.274376')
            await donate.connect(d2).registerDonator('Moses', '24.197197', '54.274376')
            await donate.connect(d3).registerDonator('Haya', '23.197197', '53.274376')
            // a total of 30 USD gets funded into the donations by the 3 donators
            await donate.connect(d1).donate({ value: donation })
            await donate.connect(d2).donate({ value: donation })
            await donate.connect(d3).donate({ value: donation })
            // a food place requests a food delivery
            await pickup.connect(fp1).requestDelivery(30)
            // the contract owner (deployer) funds the delivery
            // await expect(pickup.connect(deployer).fundDelivery()).to.emit(pickup, "RevertTest")
            // await pickup.connect(deployer).fundDelivery()
        })
        it("Deducts 25 USD from the donations", async () => {
            await pickup.connect(deployer).fundDelivery()
            donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d1.address))
            assert.equal(donationAmount.toString(), 0)
            donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d2.address))
            assert.equal(donationAmount, 0)
            donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d3.address))
            assert.equal((donationAmount/10**18), 5)
        })
        xit("notifies the donator which restaurant used their donation", async () => {
            await expect(
                donate.connect(d1).registerDonator("RifRof", "25.197197", "55.274376")
            ).to.emit(donate, "DonatorRegistered").withArgs(0, "RifRof", "25.197197", "55.274376")
        })
    })
})
