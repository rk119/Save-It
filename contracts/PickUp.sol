// SPDX-License-Identifier: MIT

// 1.	Implement a basic pickup.sol.
// a.	Add tests to see if the accounts balances are deducted correctly
//      and if u received the correct amount after all the deductions.

// 3.	Then implement cost calculation using the API service.
// a.	First look for any API that calculates cost between two locations in the US state.
// b.	Then implement using chainlink API services.

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Donate.sol";
import "hardhat/console.sol";

contract PickUp is Ownable {
    // this section describes a food organization and its methods
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // a struct to describe a food
    // seller, like a restuarant
    struct FoodPlace {
        uint256 id;
        address owner;
        string name;
        string location;
        bool registered;
    }
    // a struct to describe a food delivery request
    struct Request {
        address requester;
        string name;
        uint256 amountInKG;
        uint256 requestId;
    }

    /* Variables */

    // the owner of the contract
    address private immutable i_owner;
    // id counter to keep track of the food places
    uint256 private i_numOfFoodPlaces;
    // address of donate contract
    address private s_addressDonate;
    // id counter to keep track of the delivery requests
    uint256 private i_numOfRequests;
    // an array to store all the pending delivery requests
    Request[] s_deliveryRequests;
    // a mapping to store all the food places
    mapping(address => FoodPlace) public s_foodPlaces;
    // to be emitted when a new food place is registered
    event FoodPlaceRegistered(
        uint256 id,
        address owner,
        string name,
        string location,
        bool registered
    );
    // to be emitted when a new food delivery is requested
    event NewRequest(
        address requester,
        uint256 amountInKG,
        uint256 requestId
    );
    // to be emitted to notify a donator of their donation usage
    event NotifyDonator(address donator, uint256 donation, string foodPlaceName);
    event RevertTest();

    constructor() {
        i_owner = msg.sender;
        i_numOfFoodPlaces = 0;
    }

    // this section describes the request of a food delivery service
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function requestDelivery(uint256 _amountInKG) public {
        // ensure the parameters are valid
        require(
            _amountInKG > 0 && _amountInKG < 300,
            "Invalid. Specified food amount can not be transported"
        );
        // if the food place is not registered, register it
        if (!s_foodPlaces[msg.sender].registered) {
            i_numOfFoodPlaces++;
            s_foodPlaces[msg.sender].registered = true;
            s_foodPlaces[msg.sender].owner = msg.sender;
            s_foodPlaces[msg.sender].id = i_numOfFoodPlaces;
            s_foodPlaces[msg.sender].name = "default name";
            s_foodPlaces[msg.sender].location = "default location";
        }
        // add a new pending request
        s_deliveryRequests.push(
            Request(msg.sender, s_foodPlaces[msg.sender].name, _amountInKG, ++i_numOfRequests)
        );
        // trigger an event for the new delivery request
        emit NewRequest(msg.sender, _amountInKG, i_numOfRequests);
    }

    // this section describes owner only methods such as funding
    // and the approval and funding of a food delivery service
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    function fundDelivery() public onlyOwner {
        require(s_deliveryRequests.length > 0, "No pending requests");
        IDonate donate = IDonate(s_addressDonate);
        Request memory request = s_deliveryRequests[0];
        console.log("request", request);
        uint256 i = 0;
        uint256 withdrawn = 0;
        uint256 cost = 25; // placeholder value for funding a delivery request
        // uint256 cost = calculateCost(d.id, d.amountInKG);
        cost = donate.getUsdAmountInEth(cost);
        while (cost > 0) {
            address donator = donate.getDonator(i);
            uint amount = donate.getAddressToAmount(donator);
            if (amount > 0) {
                if (amount >= cost) {
                    withdrawn = uint(donate.withdraw(donator, cost));
                }
                if (amount < cost) {
                    withdrawn = uint(donate.withdraw(donator, amount));
                }
                cost -= withdrawn;
                emit NotifyDonator(donator, withdrawn, request.name);
            }
            i++;
        }
        // emit RevertTest();
        delete s_deliveryRequests[0];
    }

    /* setter functions */
    function setAddress(address _addressDonate) external onlyOwner {
        s_addressDonate = _addressDonate;
    }

    function setName(string memory _name) public {
        s_foodPlaces[msg.sender].name = _name;
    }

    function setLocation(string memory _location) public {
        s_foodPlaces[msg.sender].location = _location;
    }

    /* getter functions */
    function numOfFoodPlaces() external view returns (uint256) {
        return i_numOfFoodPlaces;
    }

    function numOfRequests() external view returns (uint256) {
        return i_numOfRequests;
    }
}
