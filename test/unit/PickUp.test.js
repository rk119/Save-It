const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")

describe("PickUp", async () => {
    let pickup, deployer, fp1, fp2, fp3, fp4 // fp = food place

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        ;[deployer, fp1, fp2, fp3, fp4, d1, d2, d3] = [
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
        it("deployer is the owner", async () => {
            const owner = await pickup.owner()
            assert.equal(owner, deployer.address)
        })
        it("number of food places and number of delivery requests are initially zero", async () => {
            let numOfFoodPlaces = await pickup.numOfFoodPlaces()
            let numOfRequests = await pickup.numOfRequests()
            assert.equal(numOfFoodPlaces, 0)
            assert.equal(numOfRequests, 0)
        })
    })

    describe("registering a single new food place", async () => {
        let numOfFoodPlaces, name, location
        beforeEach(async () => {
            await pickup.connect(fp1).requestDelivery(30)
            numOfFoodPlaces = await pickup.numOfFoodPlaces()
            name = await pickup.connect(fp1).getName()
            location = await pickup.connect(fp2).getLocation()
        })
        it("registers a food place", async () => {
            assert.equal(numOfFoodPlaces, 1)
            assert.equal(name, "")
            assert.equal(location, "")
        })
        // SUCCESS: parameters are valid
        it("should be successful when params are valid", async () => {
            await expect(pickup.connect(fp1).requestDelivery(22))
                .to.emit(pickup, "NewRequest")
                .withArgs(fp1.address, 22, 2)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(
                pickup.connect(fp2).requestDelivery(301)
            ).to.be.revertedWith(
                "Invalid. Specified food amount can not be transported"
            )
        })
    })

    describe("registering multiple new food places", async () => {
        let numOfFoodPlaces
        let name1, name2, name3, name4
        let location1, location2, location3, location4
        beforeEach(async () => {
            // register the food places by placing a delivery request
            await pickup.connect(fp1).requestDelivery(29)
            await pickup.connect(fp2).requestDelivery(69)
            await pickup.connect(fp3).requestDelivery(45)
            await pickup.connect(fp4).requestDelivery(32)
            numOfFoodPlaces = await pickup.numOfFoodPlaces()
            // set the food place names
            await pickup.connect(fp1).setName("Food Place 1")
            await pickup.connect(fp2).setName("Food Place 2")
            await pickup.connect(fp3).setName("Food Place 3")
            await pickup.connect(fp4).setName("Food Place 4")
            // set the food place locations
            await pickup.connect(fp1).setLocation("West Bay, Springs")
            await pickup.connect(fp2).setLocation("North Bay, Springs")
            await pickup.connect(fp3).setLocation("East Bay, Springs")
            await pickup.connect(fp4).setLocation("South Bay, Springs")
        })
        it("registers multiple food places", async () => {
            assert.equal(numOfFoodPlaces, 4)
        })
        it("checks the name of the food place 1", async () => {
            name1 = await pickup.connect(fp1).getName()
            assert.equal(name1, "Food Place 1")
        })
        it("checks the name of the food place 2", async () => {
            name2 = await pickup.connect(fp2).getName()
            assert.equal(name2, "Food Place 2")
        })
        it("checks the name of the food place 3", async () => {
            name3 = await pickup.connect(fp3).getName()
            assert.equal(name3, "Food Place 3")
        })
        it("checks the name of the food place 4", async () => {
            name4 = await pickup.connect(fp4).getName()
            assert.equal(name4, "Food Place 4")
        })
        it("checks the locations of the food places", async () => {
            location1 = await pickup.connect(fp1).getLocation()
            location2 = await pickup.connect(fp2).getLocation()
            location3 = await pickup.connect(fp3).getLocation()
            location4 = await pickup.connect(fp4).getLocation()
            assert.equal(location1, "West Bay, Springs")
            assert.equal(location2, "North Bay, Springs")
            assert.equal(location3, "East Bay, Springs")
            assert.equal(location4, "South Bay, Springs")
        })
        // SUCCESS: parameters are valid
        it("should be successful when params are valid", async () => {
            await expect(pickup.connect(fp2).requestDelivery(22))
                .to.emit(pickup, "NewRequest")
                .withArgs(fp2.address, 22, 5)
            await expect(pickup.connect(fp3).requestDelivery(43))
                .to.emit(pickup, "NewRequest")
                .withArgs(fp3.address, 43, 6)
            await expect(pickup.connect(fp4).requestDelivery(39))
                .to.emit(pickup, "NewRequest")
                .withArgs(fp4.address, 39, 7)
            await expect(pickup.connect(fp2).requestDelivery(32))
                .to.emit(pickup, "NewRequest")
                .withArgs(fp2.address, 32, 8)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(
                pickup.connect(fp2).requestDelivery(420)
            ).to.be.revertedWith(
                "Invalid. Specified food amount can not be transported"
            )
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
                .to.emit(pickup, "NewRequest")
                .withArgs(fp2.address, 22, 2)
        })
        // FAILURE: parameters invalid or empty
        it("fails if the params are invalid", async () => {
            await expect(
                pickup.connect(fp2).requestDelivery(500)
            ).to.be.revertedWith(
                "Invalid. Specified food amount can not be transported"
            )
            await expect(
                pickup.connect(fp3).requestDelivery(0)
            ).to.be.revertedWith(
                "Invalid. Specified food amount can not be transported"
            )
        })
    })

    // // test the appending of a new delivery request
    describe("Funding of a delivery", async () => {
        let donate,
            donation,
            originalBalance
        beforeEach(async () => {
            await deployments.fixture(["all"])
            donate = await ethers.getContract("Donate")
            await pickup.setAddress(donate.address)
            await donate.setAddress(pickup.address)
            // originalBalance = await deployer.getBalance()
            // console.log((await donate.getConversionRate(originalBalance)).toString())
            donation = await donate.getUsdAmountInEth(10)
            // register 3 different donators
            await donate.connect(d1).registerDonator("RifRof", "25.197197", "55.274376")
            await donate.connect(d2).registerDonator("Moses", "24.197197", "54.274376")
            await donate.connect(d3).registerDonator("Haya", "23.197197", "53.274376")
            // a total of 30 USD gets funded into the donations by the 3 donators
            await donate.connect(d1).donate({ value: donation })
            await donate.connect(d2).donate({ value: donation })
            await donate.connect(d3).donate({ value: donation })
            // a food place requests a food delivery
            await pickup.connect(fp1).requestDelivery(30)
            // the contract owner (deployer) funds the delivery
            // await expect(pickup.connect(deployer).fundDelivery()).to.emit(pickup, "RevertTest")
            originalBalance = await deployer.getBalance()
            // console.log((await donate.getConversionRate(originalBalance)).toString())
            // await pickup.fundDelivery()
            // console.log((await donate.getConversionRate(await donate.getAddressToAmount(d1.address))).toString())
            // donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d1.address))
        })
        it("Deducts 25 USD from the donations", async () => {
            await pickup.fundDelivery()
            let amount = await donate.getUsdAmountInEth(25)
            let expected = originalBalance.add(amount)
            let newBalance = await deployer.getBalance()
            assert.equal(
                Math.round(ethers.utils.formatEther(newBalance)),
                Math.round(ethers.utils.formatEther(expected))
            )
            // assert.equal((newBalance).toString(), (await donate.getConversionRate(originalBalance)).toString())
            // donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d1.address))
            // assert.equal(donationAmount.toString(), "0")
            // donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d2.address))
            // assert.equal(donationAmount.toString(), "0")
            // donationAmount = await donate.getConversionRate(await donate.getAddressToAmount(d3.address))
            // assert.equal((donationAmount/10**18).toString(), "5")
        })
        it("fails if caller is not owner", async () => {
            await expect(pickup.connect(d1).fundDelivery()).to.be.revertedWith("Not the owner")
        })
        it("notifies the donator which restaurant used their donation", async () => {
            await expect(pickup.fundDelivery()).to.emit(pickup,"RevertTest")
        })
        it("handles the request", async () => {
            await pickup.fundDelivery()
            numOfRequests = await pickup.numOfRequests()
            assert.equal(numOfRequests, 0)
        })
    })
})
