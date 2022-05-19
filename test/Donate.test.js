const Donate = artifacts.require('Donate.sol');
const MockV3Aggregator = artifacts.require('MockV3Aggregator.sol');

require('chai').use(require('chai-as-promised')).should()

describe("Donate contract", function () {
    let accounts, donate, mockV3Aggregator;
  
    before(async function () {
        accounts = await web3.eth.getAccounts();
        [deployer, donator1, donator2] = [accounts[0], accounts[1], accounts[2]]
        mockV3Aggregator = await MockV3Aggregator.new(8, 200000000000)
        donate = await Donate.new(mockV3Aggregator.address, { from: deployer })
    });

    describe('deployment of Donate', async () => {
        it('deploys Donate successfully', async () => {
            const address = await donate.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('owner is deployer', async () => {
            const owner = await donate.owner()
            assert.equal(owner, deployer)
        })

        it('total donations, donators and entries are initially zero', async () => {
            const totalDonators = await donate.totalDonators()
            const totalDonations = await donate.totalDonations()
            const entries = await donate.entries()
            assert.equal(totalDonators, 0)
            assert.equal(totalDonations, 0)
            assert.equal(entries, 0)
        })
    })

    describe('donating', async () => {
        let result, oldBalance, donation

        before(async () => {
            oldBalance = await web3.eth.getBalance(donator1)
            oldBalance = new web3.utils.BN(oldBalance)
            donation = web3.utils.toWei('0.0052', 'Ether')
            result = await donate.donate({ from: donator1, value: donation })
            donation = new web3.utils.BN(donation)
        })

        it('emits a transaction event', async () => {
            const event = result.logs[0].args
            assert.equal(result.logs[0].event, 'DonationAccepted')
            assert.equal(event.donor, donator1)
            assert.equal(event.amount, web3.utils.toWei('0.0052', 'Ether'))
        })

        it('deducts eth from donator1', async () => {
            let newBalance = await web3.eth.getBalance(donator1)
            newBalance = new web3.utils.BN(newBalance)
            const exepectedBalance = oldBalance.sub(donation)
            assert.equal(Math.round(web3.utils.fromWei(newBalance, 'ether')), Math.round(web3.utils.fromWei(exepectedBalance, 'ether')))
        })

        it('check mapping', async () => {
            let donateBalance = await donate.getAddressToAmount(donator1)
            donateBalance = new web3.utils.BN(donateBalance)
            assert.equal(donateBalance.toString(), donation.toString(), 'stores the address and amount donated')
            
            let address = await donate.getIdToAddress(1)
            assert.equal(address, donator1, 'enters id to address in the entry')
        })

        it('donations and donators incremented', async () => {
            const totalDonations = await donate.totalDonations()
            assert.equal(totalDonations, web3.utils.toWei('0.0052', 'Ether'))
            const totalDonators = await donate.totalDonators()
            assert.equal(totalDonators, 1)
        })

        it('same address makes another donation', async () => {
            let donateInitialBalance = await donate.getAddressToAmount(donator1)
            donateInitialBalance = new web3.utils.BN(donateInitialBalance)

            let anotherDonation = web3.utils.toWei('0.01', 'Ether')
            await donate.donate({ from: donator1, value: anotherDonation })
            anotherDonation = new web3.utils.BN(anotherDonation)

            let donateNewBalance = await donate.getAddressToAmount(donator1)
            donateNewBalance = new web3.utils.BN(donateNewBalance)

            const exepectedBalance = donateInitialBalance.add(anotherDonation)
            const totalDonations = await donate.totalDonations()
            const totalDonators = await donate.totalDonators()

            assert.equal(donateNewBalance.toString(), exepectedBalance.toString(), 'contract increments amount donated for address correctly')
            assert.equal(totalDonations, web3.utils.toWei('0.0152', 'Ether'), 'total donations incremented correctly')
            assert.equal(totalDonators, 1, 'same address does not increment address')
        })

        it('different address makes another donation', async () => {
            let oldBalance2 = await web3.eth.getBalance(donator2)
            oldBalance2 = new web3.utils.BN(oldBalance2)
            let secondDonation = web3.utils.toWei('0.008', 'Ether')
            let result2 = await donate.donate({ from: donator2, value: secondDonation })
            secondDonation = new web3.utils.BN(secondDonation)

            const event = result2.logs[0].args
            assert.equal(result2.logs[0].event, 'DonationAccepted', 'Correct event emitted')
            assert.equal(event.donor, donator2)
            assert.equal(event.amount, web3.utils.toWei('0.008', 'Ether'))

            let newBalance = await web3.eth.getBalance(donator2)
            newBalance = new web3.utils.BN(newBalance)
            const exepectedBalance = oldBalance2.sub(secondDonation)
            assert.equal(Math.round(web3.utils.fromWei(newBalance, 'ether')), Math.round(web3.utils.fromWei(exepectedBalance, 'ether')), 'correctly deducts eth from donator2')

            let donateBalance = await donate.getAddressToAmount(donator2)
            donateBalance = new web3.utils.BN(donateBalance)
            assert.equal(donateBalance.toString(), secondDonation.toString(), 'correctly stores the donator2 address and amount donated')
            
            let address = await donate.getIdToAddress(3)
            assert.equal(address, donator2, 'correct id to donator2 address in the entry')

            const totalDonations = await donate.totalDonations()
            assert.equal(totalDonations, web3.utils.toWei('0.0232', 'Ether'), 'correct total amount of donations')
            const totalDonators = await donate.totalDonators()
            assert.equal(totalDonators, 2, 'correctly increments the number of donators')
        })

        it('fails if donation amount is less than minimum', async () => {
            await donate.donate({ from: donator1, value: web3.utils.toWei('0.001', 'Ether') }).should.be.rejected
        })

        it('check if eth is returned when usd is passed', async () => {
            let usd = await donate.getConversionRate(web3.utils.toWei('0.1', 'Ether')) 
            usd = new web3.utils.BN(usd)
            let eth = await donate.getUsdAmountInEth(usd / (10 ** 18))
            eth = new web3.utils.BN(eth)
            assert.equal(eth.toString(), web3.utils.toWei('0.1', 'Ether'), 'correctly converts usd to eth')
        })

        it('owner can withdraw', async () => {
            let oldContractBalance = await web3.eth.getBalance(donate.address)
            oldContractBalance = new web3.utils.BN(oldContractBalance)
            let oldDeployerBalance = await web3.eth.getBalance(deployer)
            oldDeployerBalance = new web3.utils.BN(oldDeployerBalance)
            let amount = await donate.getUsdAmountInEth(2)
            await donate.withdraw(donator2, amount, { from: deployer })
            let newContractBalance = await web3.eth.getBalance(donate.address)
            newContractBalance = new web3.utils.BN(newContractBalance)
            let newDeployerBalance = await web3.eth.getBalance(deployer)
            newDeployerBalance = new web3.utils.BN(newDeployerBalance)
            const exepectedContractBalance = oldContractBalance.sub(amount)
            const exepectedDeployerBalance = oldDeployerBalance.add(amount)
            assert.equal(Math.round(web3.utils.fromWei(newContractBalance, 'ether')), Math.round(web3.utils.fromWei(exepectedContractBalance, 'ether')))
            assert.equal(Math.round(web3.utils.fromWei(newDeployerBalance, 'ether')), Math.round(web3.utils.fromWei(exepectedDeployerBalance, 'ether')))
        })

        it('fails if caller is not owner', async () => {
            await donate.withdraw(donator2, web3.utils.toWei('0.0001', 'Ether'), { from: donator1 }).should.be.rejected
        })

        it('fails if amount is greater than donated balance', async () => {
            await donate.withdraw(donator2, web3.utils.toWei('0.2', 'Ether'), { from: deployer }).should.be.rejected
        })
    })
})
