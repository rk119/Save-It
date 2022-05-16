// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Donate {

    address public owner;
    uint256 public totalDonators;
    uint256 public totalDonations;
    uint256 public entries;
    // AggregatorV3Interface public priceFeed;
    mapping(address => bool) public addressToRegistered;
    mapping(address => uint256) public addressToAmount;
    mapping(uint256 => address) public idToAddress;
    event DonationAccepted(address indexed donor, uint256 amount);

    constructor() {
        // priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
        totalDonators = 0;
        totalDonations = 0;
        entries = 0;
    }

    function donate() public payable {
        uint256 minimumEth = 1000000000000000000;
        require(msg.value >= minimumEth);
        // require(getConversionRate(msg.value) >= minimumUSD, "You need to spend more ETH!");
        addressToAmount[msg.sender] += msg.value;
        totalDonations += msg.value;
        idToAddress[++entries] = msg.sender;
        if (!addressToRegistered[msg.sender]) {
            addressToRegistered[msg.sender] = true;
            totalDonators++;
        }
        emit DonationAccepted(msg.sender, msg.value);
    }
}