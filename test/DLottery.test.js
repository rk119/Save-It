const { assert, AssertionError } = require("chai");

const DLottery = artifacts.require("DLottery.sol");

require("chai").use(require("chai-as-promised")).should();

describe("DLottery contract", function () {
    let accounts, dlottery;

    before(async function () {
        accounts = await web3.eth.getAccounts();
        [deployer, donator1, donator2, donator3, donator4, donator5, donator6] =
            accounts;
        dlottery = await DLottery.new(
            "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
            "3499",
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            "500000"
        );
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
            assert.equal(event1.food, "Sooubway: Veggie Pattie", "the food is correct");
            assert.equal(event2.food, "Sooubway: Meatball", "the food is correct");
            assert.equal(event3.food, "Sooubway: Steak and Cheeks","the food is correct");
            assert.equal(event4.food, "Sooubway: Smoked Turkey", "the food is correct");
        });
    });
});
