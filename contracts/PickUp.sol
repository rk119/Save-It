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

contract PickUp is Ownable {
    // this section describes a food organization and its methods
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // a struct to describe a food
    // seller, like a restuarant
    struct FoodPlace {
        uint256 id;
        string name;
        string latitude;
        string longitude;
        address owner;
    }

    // a struct to describe a food delivery request
    struct DeliveryRequest {
        uint256 id;
        uint256 amountInGrams;
        uint256 requestId;
        bool approved;
        address requester;
    }

    // the owner of the contract
    address private immutable i_owner;
    // id counter to keep track of the food places
    uint256 public s_foodPlaceId;
    
    address private s_addressDonate;
    // id counter to keep track of the delivery requests
    uint256 public s_requestId;
    // an array to store all the pending delivery requests
    DeliveryRequest[] s_deliveryRequests;
    // a mapping to store all the food places
    mapping(uint256 => FoodPlace) public s_foodPlaces;
    // to be emitted when a new food place is registered
    event FoodPlaceRegistered(uint256 id);
    // to be emitted when a new food delivery is requested
    event Request(uint256 id, uint256 amountInGrams, uint256 requestId, bool approved, address requester);
    event NotifyDonator(address donator, uint256 donation, uint256 foodPlaceId);

    constructor() {
        i_owner = msg.sender;
        s_foodPlaceId = 0;
    }

    // register a new food place and add it to the mapping
    function registerFoodPlace(string memory _name, string memory _latitude, string memory _longitude) public {
        // ensure the parameters are valid
        require(bytes(_name).length > 0, "Invalid. Name cannot be empty");
        require(bytes(_latitude).length > 0, "Invalid. Latitude cannot be empty");
        require(bytes(_longitude).length > 0, "Invalid. Longitude cannot be empty");
        // increment the counterId
        s_foodPlaceId++;
        // add the food place to the mapping
        s_foodPlaces[s_foodPlaceId] = FoodPlace(s_foodPlaceId, _name, _latitude, _longitude, msg.sender);
        // trigger an event to say a food place was registered
        emit FoodPlaceRegistered(s_foodPlaceId);
    }

    // this section describes the request of a food delivery service
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

    // a food place can request the transportation
    // service to pack and deliver their food
    function requestDelivery(uint256 _id, uint256 _amountInGrams) public {
        // ensure the parameters are valid
        require(_id > 0 && _id <= s_foodPlaceId, "Invalid. ID does not exist");
        require(_amountInGrams > 0 && _amountInGrams < 100000, "Invalid. Specified food amount can not be transported");
        // increment the requestsId
        s_requestId++;
        // add a new pending request
        s_deliveryRequests.push(DeliveryRequest(_id, _amountInGrams, s_requestId, false, msg.sender));
        // trigger an event for the new delivery request
        emit Request(_id, _amountInGrams, s_requestId, false, msg.sender);
    }

    // this section describes owner only methods such as funding
    // and the approval and funding of a food delivery service
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    
    function setAddress(address _addressDonate) external onlyOwner { 
        s_addressDonate = _addressDonate;
    }
    
    // onlyOwner function that approves a delivery request
    // the owner will fund the request from the donation pool
    function fundDelivery() public onlyOwner {
        require(s_deliveryRequests.length > 0, "No pending requests");
        IDonate donate = IDonate(s_addressDonate);
        DeliveryRequest memory d = s_deliveryRequests[0];
        uint256 i = 0;
        uint256 withdrawn = 0;
        uint256 cost = 25; // temporary default value for funding a delivery request
        // uint256 cost = calculateCost(d.id, d.amountInGrams);
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
                emit NotifyDonator(donator, withdrawn, d.id);
            }
            i++;
        }
        emit Request(d.id, d.amountInGrams, d.requestId, true, d.requester);
        delete s_deliveryRequests[0];
    }

    // calculates the cost of a given delivery request
    function calculateCost(uint256 _id, uint256 _amountInGrams)
        public
        returns (uint256)
    {
        // calculate the cost of the delivery
        // return the cost
    }
}
