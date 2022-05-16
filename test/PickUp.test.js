const PickUp = artifacts.require("PickUp.sol");

require("chai").use(require("chai-as-promised")).should();

describe("PickUp contract", function () {
    let accounts, pickup;
  
    before(async function () {
        accounts = await web3.eth.getAccounts();
        [deployer, foodPlace1, foodPlace2, foodPlace3, foodPlace4] = accounts;
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

    // test the registering of a new food place
    describe("Registering of a food place", async () => {
      let result, numOfFoodPlaces;
      beforeEach(async () => {
        result = await pickup.registerFoodPlace(
          "Baskin Robbins",
          "42.51276",
          "6.89210",
          { from: foodPlace1 }
        );
        numOfFoodPlaces = await pickup.foodPlaceId();
      });
      it("Resgisters a food place", async () => {
        assert.equal(numOfFoodPlaces, 1);
        const event = result.logs[0].args;
        assert.equal(
          event.id.toNumber(),
          numOfFoodPlaces.toNumber(),
          "the id is correct"
        );
        // SUCCESS: parameters are valid
        assert.equal(event.name, "Baskin Robbins", "the name is correct");
        assert.equal(event.latitude, "42.51276", "the latitude is correct");
        assert.equal(event.longitude, "6.89210", "the logitude is correct");
        assert.equal(event.owner, foodPlace1, "the owner is correct");
        // FAILURE: parameters cannot be empty
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
          "42.51276",
          "6.89210",
          { from: foodPlace2 }
        );
        result3 = await pickup.registerFoodPlace(
          "McDonalds",
          "42.51276",
          "6.89210",
          { from: foodPlace3 }
        );
        result4 = await pickup.registerFoodPlace(
          "Wingsters",
          "42.51276",
          "6.89210",
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
          // FAILURE: parameters invalid or empty
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
          {
            from: foodPlace1,
          }
        );
        result = await pickup.requestDelivery(1, 10000);
        numOfRequests = await pickup.requestId();
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
        // FAILURE: parameters are invalid
        await pickup.registerFoodPlace(0, 0, "6.89210", {
          from: foodPlace1,
        }).should.be.rejected;
        await pickup.registerFoodPlace(-5, 500, "6.89210", {
          from: foodPlace1,
        }).should.be.rejected;
        await pickup.registerFoodPlace(1, -5, "6.89210", {
          from: foodPlace1,
        }).should.be.rejected;
        await pickup.registerFoodPlace(3, 0, "6.89210", {
          from: foodPlace1,
        }).should.be.rejected;
        await pickup.registerFoodPlace(1, 101000, "6.89210", {
          from: foodPlace1,
        }).should.be.rejected;
      });
    });
  }
);
