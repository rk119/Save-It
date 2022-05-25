// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Donate.sol";
import "hardhat/console.sol";

contract PickUp is Ownable {
    // a struct to describe a food seller, like a restuarant
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
    }

    /* Variables */

    address private immutable i_owner;
    address private s_donate;
    IDonate private donate;
    uint256 private i_numOfFoodPlaces;
    Request[] s_deliveryRequests;
    mapping(address => FoodPlace) public s_foodPlaces;
    event NewRequest(address requester, uint256 amountInKG);
    event NotifyDonator(
        address donator,
        uint256 donation,
        string foodPlaceName
    );
    event RequestFunded(address requester, uint index);

    constructor() {
        i_owner = msg.sender;
        i_numOfFoodPlaces = 0;
    }

    function requestDelivery(uint256 _amountInKG) public {
        // ensure the parameters are valid
        require(
            _amountInKG > 0 && _amountInKG < 300,
            "Invalid. Specified food amount can not be transported"
        );
        // if the food place is not registered, register it
        if (!s_foodPlaces[msg.sender].registered) {
            i_numOfFoodPlaces++;
            FoodPlace memory fp = FoodPlace(
                i_numOfFoodPlaces,
                msg.sender,
                "",
                "default location",
                true
            );
            s_foodPlaces[msg.sender] = fp;
        }
        Request memory newRequest = Request(
            msg.sender,
            s_foodPlaces[msg.sender].name,
            _amountInKG
        );
        s_deliveryRequests.push(newRequest);
        // trigger an event for the new delivery request
        emit NewRequest(msg.sender, _amountInKG);
    }

    function fundDelivery() external {
        require(s_deliveryRequests.length > 0, "No pending requests");
        Request memory request;
        uint256 requests = s_deliveryRequests.length;
        uint256 cost = 25 * requests; // placeholder value for funding a delivery request
        // uint256 balance = address(donate).balance;
        uint256 i = 0;
        uint256 withdrawn = 0;
        donate = IDonate(s_donate);
        cost = donate.getUsdAmountInEth(cost);
        // balance = donate.getUsdAmountInEth(balance);
        // require(
        //     balance >= donate.getUsdAmountInEth(25),
        //     "Insufficient funds"
        // );
        for (uint k = 0; k < requests; k++) {
            request = s_deliveryRequests[0];
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
                    emit RequestFunded(request.requester, k);
                }
                i++;
            }
            uint size = numOfRequests();
            if (size >= 1) {
                uint newIndex = size - 1;
                s_deliveryRequests[0] = s_deliveryRequests[newIndex];
                s_deliveryRequests.pop();
            }
        }
    }

    /* setter functions */
    function setAddress(address _addressDonate) external {
        s_donate = _addressDonate;
    }

    function setName(string memory _name) public {
        s_foodPlaces[msg.sender].name = _name;
    }

    function setLocation(string memory _location) public {
        s_foodPlaces[msg.sender].location = _location;
    }

    /* getter functions */
    function numOfFoodPlaces() public view returns (uint256) {
        return i_numOfFoodPlaces;
    }

    function numOfRequests() public view returns (uint256) {
        return s_deliveryRequests.length;
    }

    function getName() external view returns (string memory) {
        return s_foodPlaces[msg.sender].name;
    }

    function getLocation() external view returns (string memory) {
        return s_foodPlaces[msg.sender].location;
    }
}
