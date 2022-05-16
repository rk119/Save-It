// SPDX-License-Identifier: MIT

// 1.	Implement a basic pickup.sol.
// a.	A simple function to request service.
// b.	Approve donations received by the owner.
// c.	Tests for each function simultaneously.

// 2.	Deduct only 25 dollars every time a request is made.
// a.	Add tests to see if the accounts balances are deducted correctly and if u received the correct amount after all the deductions.

// 3.	Then implement cost calculation using the API service.
// a.	First look for any API that calculates cost between two locations in the US state.
// b.	Then implement using chainlink API services.

pragma solidity ^0.8.7;

contract PickUp {
    // filler variable
    string public name;
    // id counter to keep track of the food places
    uint256 public foodPlaceId;
    // a mapping to store all the food places
    mapping(uint256 => foodPlace) public foodPlaces;

    // a struct to describe a food
    // seller, like a restuarant
    struct foodPlace {
        uint256 id;
        string name;
        string latitude;
        string longitude;
        address owner;
    }

    // to be emitted when a new food place is registered
    event foodPlaceRegistered(
        uint256 id,
        string name,
        string latitude,
        string longitude,
        address owner
    );

    constructor() {
        name = "PickUp";
        foodPlaceId = 0;
    }

    // register a new food place and adds it to the mapping
    function registerFoodPlace(
        string memory _name,
        string memory _latitude,
        string memory _longitude
    ) public {
        // ensure the parameters are valid
        require(bytes(_name).length > 0, "Invalid. Name cannot be empty");
        require(
            bytes(_latitude).length > 0,
            "Invalid. Latitude cannot be empty"
        );
        require(
            bytes(_longitude).length > 0,
            "Invalid. Longitude cannot be empty"
        );
        // increment the counterId
        foodPlaceId++;
        // add the food place to the mapping
        foodPlaces[foodPlaceId] = foodPlace(
            foodPlaceId,
            _name,
            _latitude,
            _longitude,
            msg.sender
        );
        // trigger an event to say a food place was registered
        emit foodPlaceRegistered(
            foodPlaceId,
            _name,
            _latitude,
            _longitude,
            msg.sender
        );
    }

    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    // id counter to keep track of the delivery requests
    uint256 public requestId;
    // a mapping to store all the delivery requests
    mapping(uint256 => foodDelivery) public deliveryRequests;

    // a struct to describe a food delivery request
    struct foodDelivery {
        uint256 id;
        uint256 amountInGrams;
        uint256 requestId;
    }

    // to be emitted when a new food delivery is requested
    event requestFoodDelivery(
        uint256 id,
        uint256 amountInGrams,
        uint256 requestId
    );

    // a food place can request the transportation 
    // service to pack and deliver their food
    function requestDelivery(
        uint256 _id,
        uint256 _amountInGrams
    ) public {
        // ensure the parameters are valid
        require(_id > 0 && _id <= foodPlaceId, "Invalid. ID does not exist");
        require(_amountInGrams > 0 && _amountInGrams < 100000, "Invalid. Specified food amount can not be transported");
        // increment the requestsId
        requestId++;
        // add a new pending request
        deliveryRequests[requestId] = foodDelivery(
            _id,
            _amountInGrams,
            requestId
        );
        // trigger an event for the new delivery request
        emit requestFoodDelivery(
            _id,
            _amountInGrams,
            requestId
        );
    }

    function approveDelivery() public {
        // ensure there are pending requests
        // require(deliveryRequests.length > 0, "No pending requests");
        // approve the donation
    }
}
