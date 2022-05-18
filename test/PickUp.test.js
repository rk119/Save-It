const PickUp = artifacts.require("PickUp.sol");

require("chai").use(require("chai-as-promised")).should();

describe("PickUp contract", function () {
    let accounts, pickup;

    before(async function () {
        accounts = await web3.eth.getAccounts();
        [
            deployer,
            foodPlace1,
            foodPlace2,
            foodPlace3,
            foodPlace4,
            requester1,
            requester2,
            donator1,
            donator2,
            donator3
        ] = accounts;
        pickup = await PickUp.new();
    });

    // test the deployment of the PickUp contract
    describe("Deployment of PickUp", async () => {
        it("Deploys PickUp successfully", async () => {
            const address = await pickup.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, "");
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
        it("has a name", async () => {
            const name = await pickup.name();
            assert.equal(name, "PickUp");
        });
    });

    // test the registering of multiple food places
    describe("Registering of a single new food place", async () => {
        let result1, numOfFoodPlaces;
        beforeEach(async () => {
            result1 = await pickup.registerFoodPlace(
                "Baskin Robbins",
                "42.51276",
                "6.89210",
                { from: foodPlace1 }
            );
            numOfFoodPlaces = await pickup.foodPlaceId();
            it("Resgisters multiple food places", async () => {
                assert.equal(numOfFoodPlaces, 1);
                const event1 = result1.logs[0].args;
                assert.equal(event1.id.toNumber(), 1, "the id is correct");
                // SUCCESS: parameters are valid
                assert.equal(event1.name, "Baskin Robbins", "the name is correct");
                assert.equal(event1.latitude, "42.51276", "the latitude is correct");
                assert.equal(event1.longitude, "6.89210", "the logitude is correct");
                assert.equal(event1.owner, foodPlace1, "the owner is correct");
                // FAILURE: parameters invalid or empty
                await pickup.registerFoodPlace("", "42.51276", "6.89210", {
                    from: foodPlace1,
                }).should.be.rejected;
                await pickup.registerFoodPlace("Baskin Robbins", "", "6.89210", {
                    from: foodPlace1,
                }).should.be.rejected;
                await pickup.registerFoodPlace("Baskin Robbins", "42.51276", "", {
                    from: foodPlace1,
                }).should.be.rejected;
                await pickup.registerFoodPlace("", "", "", {
                    from: foodPlace1,
                }).should.be.rejected;
            });
        });
    });

    // test the registering of multiple food places
    describe("Registering of multiple food places", async () => {
        let result1, result2, result3, result4, numOfFoodPlaces;
        beforeEach(async () => {
            result1 = await pickup.registerFoodPlace(
                "Baskin Robbins",
                "42.51276",
                "6.89210",
                { from: foodPlace1 }
            );
            result2 = await pickup.registerFoodPlace(
                "Subway",
                "28.71936",
                "-13.04778",
                { from: foodPlace2 }
            );
            result3 = await pickup.registerFoodPlace(
                "McDonalds",
                "61.35851",
                "52.69650",
                { from: foodPlace3 }
            );
            result4 = await pickup.registerFoodPlace(
                "Wingsters",
                "-7.68504",
                "-126.22948",
                { from: foodPlace4 }
            );
            numOfFoodPlaces = await pickup.foodPlaceId();
            it("Resgisters multiple food places", async () => {
                assert.equal(numOfFoodPlaces, 4);
                const event1 = result1.logs[0].args;
                const event2 = result2.logs[0].args;
                const event3 = result3.logs[0].args;
                const event4 = result4.logs[0].args;
                assert.equal(event1.id.toNumber(), 1, "the id is correct");
                assert.equal(event2.id.toNumber(), 2, "the id is correct");
                assert.equal(event3.id.toNumber(), 3, "the id is correct");
                assert.equal(event4.id.toNumber(), 4, "the id is correct");
                // SUCCESS: parameters are valid
                assert.equal(event1.name, "Baskin Robbins", "the name is correct");
                assert.equal(event2.name, "Subway", "the name is correct");
                assert.equal(event3.name, "McDonalds", "the name is correct");
                assert.equal(event4.name, "Wingsters", "the name is correct");
                assert.equal(event1.owner, foodPlace1, "the owner is correct");
                assert.equal(event2.owner, foodPlace2, "the owner is correct");
                assert.equal(event3.owner, foodPlace3, "the owner is correct");
                assert.equal(event4.owner, foodPlace4, "the owner is correct");
                // FAILURE: parameters invalid or empty
                await pickup.registerFoodPlace("0", "0", "0", {
                    from: foodPlace1,
                }).should.be.rejected;
                await pickup.registerFoodPlace("", "", "", {
                    from: foodPlace2,
                }).should.be.rejected;
            });
        });
    });

    // test the appending of a new delivery request
    describe("Request of a new food delivery", async () => {
        let result, numOfRequests;
        beforeEach(async () => {
            await pickup.registerFoodPlace(
                "Baskin Robbins",
                "42.51276",
                "6.89210",
                { from: foodPlace1 }
            );
            result = await pickup.requestDelivery(1, 10000, { from: requester1 });
            numOfRequests = await pickup.s_requestId();
        });
        it("Appends a new delivery request", async () => {
            assert.equal(numOfRequests, 1);
            const event = result.logs[0].args;
            assert.equal(
                event.id.toNumber(),
                numOfRequests.toNumber(),
                "the id is correct"
            );
            // SUCCESS: parameters are valid
            // the expected values need to be changed
            assert.equal(event.id, 1, "the ID is correct");
            assert.equal(event.amountInGrams, 10000, "the amount is correct");
            assert.equal(event.requester, requester1, "the requester is correct");
            // FAILURE: parameters are invalid
            await pickup.registerFoodPlace(0, 0, "6.89210", { from: foodPlace1, }).should.be.rejected;
            await pickup.registerFoodPlace(-5, 500, "6.89210", { from: foodPlace1, }).should.be.rejected;
            await pickup.registerFoodPlace(1, -5, "6.89210", { from: foodPlace1, }).should.be.rejected;
            await pickup.registerFoodPlace(3, 0, "6.89210", { from: foodPlace1, }).should.be.rejected;
            await pickup.registerFoodPlace(1, 101000, "6.89210", { from: foodPlace1, }).should.be.rejected;
        });
    });

    // test the appending of a new delivery request
    describe("Funding of a delivery", async () => {
        let result, donationAmount;
        beforeEach(async () => {
            await pickup.registerFoodPlace(
                "Baskin Robbins",
                "42.51276",
                "6.89210",
                { from: foodPlace1 }
            );
            await pickup.fund(10, { from: donator1 });
            await pickup.fund(10, { from: donator2 });
            await pickup.fund(10, { from: donator3 });
            await pickup.requestDelivery(1, 10000, { from: requester1 });
            result = await pickup.fundDelivery({ from: deployer });
        });
        it("Deducts 25 USD from the donations", async () => {
            donationAmount = await pickup.getDonation(0);
            assert.equal(donationAmount, 0);
            donationAmount = await pickup.getDonation(1);
            assert.equal(donationAmount, 0);
            donationAmount = await pickup.getDonation(2);
            assert.equal(donationAmount, 5);
        });
    });
});
