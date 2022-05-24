const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")

describe("Donate", async () => {
    let donate, mockV3Aggregator, deployer, donator1, donator2
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [ deployer, donator1, donator2 ] = [accounts[0], accounts[1], accounts[2]]
        await deployments.fixture(["all"])
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        donate = await ethers.getContract("Donate")
    })

    describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await donate.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })

        it("owner is deployer", async () => {
            const owner = await donate.owner()
            assert.equal(owner, deployer.address)
        })

        it("total donations, donators and entries are initially zero", async () => {
            const totalDonators = await donate.s_totalDonators()
            const totalDonations = await donate.s_totalDonations()
            const entries = await donate.s_entries()
            assert.equal(totalDonators, 0)
            assert.equal(totalDonations, 0)
            assert.equal(entries, 0)
        })
    })

    describe("deployment of Donate", async () => {
        it("deploys Donate successfully", async () => {
            const address = await donate.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, "")
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe("donating", async () => {
        let result, oldBalance, donation

        beforeEach(async () => {
            oldBalance = await donator1.getBalance()
            donation = await donate.getUsdAmountInEth(10)
            result = await donate.connect(donator1).donate({ value: donation })  
        })

        it("emits a transaction event", async () => {
            result.events?.filter((x) => {
                assert.equal(x.event, "DonationAccepted")
                assert.equal(x.donor, donator1)
                assert.equal(x.amount, donate.getUsdAmountInEth(10))
            })
        })

        it("deducts eth from donator1", async () => {
            let newBalance = await donator1.getBalance()
            const exepectedBalance = oldBalance.sub(donation)
            assert.equal(Math.round(ethers.utils.formatEther(newBalance)), Math.round(ethers.utils.formatEther(exepectedBalance)))
        })

        it("check mapping", async () => {
            let donateBalance = await donate.getAddressToAmount(donator1.address)
            assert.equal(donateBalance.toString(), donation.toString(), "stores the address and amount donated")
            let address = await donate.getIdToAddress(1)
            assert.equal(address, donator1.address, "enters id to address in the entry")
        })

        it("donations and donators incremented", async () => {
            const totalDonations = await donate.s_totalDonations()
            assert.equal(totalDonations.toString(), (await donate.getUsdAmountInEth(10)).toString())
            const totalDonators = await donate.s_totalDonators()
            assert.equal(totalDonators, 1)
        })

        it("same address makes another donation", async () => {
            let donateInitialBalance = await donate.getAddressToAmount(donator1.address)
            let anotherDonation = await donate.getUsdAmountInEth(20)
            await donate.connect(donator1).donate({ value: anotherDonation })
            let donateNewBalance = await donate.getAddressToAmount(donator1.address)

            const exepectedBalance = donateInitialBalance.add(anotherDonation)
            const totalDonations = await donate.s_totalDonations()
            const totalDonators = await donate.s_totalDonators()

            assert.equal(donateNewBalance.toString(), exepectedBalance.toString(), "contract increments amount donated for address correctly")
            assert.equal(totalDonations.toString(), (await donate.getUsdAmountInEth(30)).toString(), "total donations incremented correctly")
            assert.equal(totalDonators, 1, "same address does not increment address")
        })

        it("different address makes another donation", async () => {
            let oldBalance2 = await donator2.getBalance()
            let secondDonation = await donate.getUsdAmountInEth(12)
            await expect(
                donate.connect(donator2).donate({ value: secondDonation })
            ).to.emit(donate, "DonationAccepted").withArgs(donator2.address, secondDonation)

            let newBalance = await donator2.getBalance()
            const exepectedBalance = oldBalance2.sub(secondDonation)
            assert.equal(Math.round(ethers.utils.formatEther(newBalance)), Math.round(ethers.utils.formatEther(exepectedBalance)), "correctly deducts eth from donator2")

            let donateBalance = await donate.getAddressToAmount(donator2.address)
            assert.equal(donateBalance.toString(), secondDonation.toString(), "correctly stores the donator2 address and amount donated")
            
            let address = await donate.getIdToAddress(2)
            assert.equal(address, donator2.address, "correct id to donator2 address in the entry")

            const totalDonations = await donate.s_totalDonations()
            assert.equal(totalDonations.toString(), (await donate.getUsdAmountInEth(22)).toString(), "correct total amount of donations")
            const totalDonators = await donate.s_totalDonators()
            assert.equal(totalDonators, 2, "correctly increments the number of donators")
        })

        it("fails if donation amount is less than minimum", async () => {
            await expect(donate.connect(donator1).donate({ value: await donate.getUsdAmountInEth(8) })).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("owner can withdraw", async () => {
            let provider = ethers.getDefaultProvider();
            let oldContractBalance = await donate.provider.getBalance(donate.address)
            let oldDeployerBalance = await deployer.getBalance()

            let amount = await donate.getUsdAmountInEth(2)
            await donate.withdraw(donator1.address, amount)

            let newContractBalance = await donate.provider.getBalance(donate.address)
            let newDeployerBalance = await deployer.getBalance()
            
            const exepectedContractBalance = oldContractBalance.sub(amount)
            const exepectedDeployerBalance = oldDeployerBalance.add(amount)
            assert.equal(Math.round(ethers.utils.formatEther(newContractBalance)), Math.round(ethers.utils.formatEther(exepectedContractBalance)))
            assert.equal(Math.round(ethers.utils.formatEther(newDeployerBalance)), Math.round(ethers.utils.formatEther(exepectedDeployerBalance)))
        })

        it("fails if caller is not owner", async () => {
            await expect(donate.connect(donator1).withdraw(donator2.address, await donate.getUsdAmountInEth(3))).to.be.revertedWith(
                "Not the owner"
            )
        })

        it("fails if amount is greater than donated balance", async () => {
            await expect(donate.withdraw(donator2.address, await donate.getUsdAmountInEth(30))).to.be.revertedWith(
                "Can't withdraw more than donated amount!"
            )
        })
    })
})
