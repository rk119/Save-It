// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Donate is Ownable {

    uint256 public constant MINIMUM_USD = 10 * 10**18;
    address payable private immutable i_owner;
    uint256 public totalDonators;
    uint256 public totalDonations;
    uint256 public entries;
    address[] private donators;
    mapping(address => bool) private addressToRegistered;
    mapping(address => uint256) private addressToAmount;
    mapping(uint256 => address) private idToAddress;
    AggregatorV3Interface private s_priceFeed;
    event DonationAccepted(address indexed donor, uint256 amount);

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = payable(msg.sender);
        totalDonators = 0;
        totalDonations = 0;
        entries = 0;
    }

    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        return uint256(answer * 10000000000);
    }

    function getConversionRate(uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }

    function donate() public payable {
        // uint256 minimumEth = 1000000000000000000;
        // require(msg.value >= minimumEth);
        // require(getConversionRate(msg.value) >= minimumUSD, "You need to spend more ETH!");
        require(getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmount[msg.sender] += msg.value;
        totalDonations += msg.value;
        idToAddress[++entries] = msg.sender;
        if (!addressToRegistered[msg.sender]) {
            donators.push(msg.sender);
            addressToRegistered[msg.sender] = true;
            totalDonators++;
        }
        // payable(i_owner).transfer(msg.value);
        emit DonationAccepted(msg.sender, msg.value);
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getDonator(uint256 index) public view returns (address) {
        return donators[index];
    }

    function getAddressToRegistered(address donator) public view returns (bool) {
        return addressToRegistered[donator];
    }

    function getAddressToAmount(address donator) public view returns (uint256) {
        return addressToAmount[donator];
    }

    function getIdToAddress(uint256 id) public view returns (address) {
        return idToAddress[id];
    }

    function withdraw(address donator, uint256 amount) public payable onlyOwner returns(uint256) {
        addressToAmount[donator] = addressToAmount[donator] - amount;
        payable(i_owner).transfer(amount);
        return amount;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}