// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Donate is Ownable {

    struct DonatorData {
        uint256 amount;
        string name;
        string latitude;
        string longitude;
    }
    uint256 public constant MINIMUM_USD = 10 * 10**18;
    address payable private immutable i_owner;
    uint256 public totalDonators;
    uint256 public totalDonations;
    uint256 public entries;
    address[] private donators;
    mapping(address => bool) private addressToRegistered;
    mapping(address => DonatorData) private addressToDonatorData;
    mapping(uint256 => address) private idToAddress;
    AggregatorV3Interface private s_priceFeed;
    event DonatorRegistered(uint256 amount, string name, string latitude, string longitude);
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

    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }

    function divider(uint numerator, uint denominator, uint precision) internal pure returns(uint) {
        return numerator*(uint(10)**uint(precision))/denominator;
    }

    function getUsdAmountInEth(uint256 usdAmount) public view returns (uint256) {
        usdAmount = usdAmount * (10 ** 18);
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 usdAmountInEth = divider(usdAmount, ethPrice, 18);
        return usdAmountInEth;
    }

    function register(string memory name, string memory latitude, string memory longitude) public {
        require(msg.sender != i_owner, "Owner cannot register as donator");
        require(!addressToRegistered[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Invalid. Name cannot be empty");
        require(bytes(longitude).length > 0, "Invalid. Longitude cannot be empty");
        require(bytes(latitude).length > 0, "Invalid. Latitude cannot be empty");
        addressToRegistered[msg.sender] = true;
        DonatorData memory data = DonatorData(0, name, latitude, longitude);
        addressToDonatorData[msg.sender] = data;
        donators.push(msg.sender);
        totalDonators++;
        emit DonatorRegistered(0, name, latitude, longitude);
    }

    function donate() public payable {
        require(msg.sender != i_owner, "Owner is already a donator");
        require(addressToRegistered[msg.sender], "You need to register first!");
        require(getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToDonatorData[msg.sender].amount += msg.value;
        totalDonations += msg.value;
        idToAddress[++entries] = msg.sender;
        emit DonationAccepted(msg.sender, msg.value);
    }

    function getDonator(uint256 index) public view returns (address) {
        return donators[index];
    }

    function getAddressToAmount(address donator) public view returns (uint256) {
        return addressToDonatorData[donator].amount;
    }

    function getAddressToDonatorData(address donator) public view returns (string memory, string memory, string memory) {
        return (addressToDonatorData[donator].name, addressToDonatorData[donator].latitude, addressToDonatorData[donator].longitude);
    }

    function getIdToAddress(uint256 id) public view returns (address) {
        return idToAddress[id];
    }

    function withdraw(address donator, uint256 amount) public payable onlyOwner returns(uint256) {
        require(addressToDonatorData[donator].amount >= amount, "Can't withdraw more than donated amount!");
        addressToDonatorData[donator].amount = addressToDonatorData[donator].amount - amount;
        payable(i_owner).transfer(amount);
        return amount;
    }
}