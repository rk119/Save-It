// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDonate {
    function getUsdAmountInEth(uint256 _usdAmount) external view returns (uint256);
    function getDonator(uint256 _index) external view returns (address); 
    function getAddressToAmount(address _donator) external view returns (uint256);
    function getIdToAddress(uint256 id) external view returns (address);
    function withdraw(address _donator, uint256 _amount) external payable returns(uint256);
    function getEntries() external view returns (uint256);
    function resetEntries() external;
}

contract Donate is Ownable {
    uint256 public constant MINIMUM_USD = 10 * 10**18;
    address payable private immutable i_owner;
    address private s_pickMe;
    address private s_dlottery;
    uint256 public s_totalDonators;
    uint256 public s_totalDonations;
    uint256 public s_entries;
    address[] private s_donators;
    mapping(address => bool) private s_addressToRegistered;
    mapping(address => uint256) private s_addressToAmount;
    mapping(uint256 => address) private s_idToAddress;
    AggregatorV3Interface private s_priceFeed;
    event DonatorRegistered(uint256 amount, string name, string latitude, string longitude);
    event DonationAccepted(address indexed donor, uint256 amount);

    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = payable(msg.sender);
        s_totalDonators = 0;
        s_totalDonations = 0;
        s_entries = 0;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getPrice(AggregatorV3Interface _priceFeed) internal view returns (uint256) {
        (, int256 answer, , , ) = _priceFeed.latestRoundData();
        return uint256(answer * 10000000000);
    }

    function getConversionRate(uint256 _ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * _ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }

    function divider(uint numerator, uint denominator, uint precision) internal pure returns(uint) {
        return numerator*(uint(10)**uint(precision))/denominator;
    }

    function getUsdAmountInEth(uint256 _usdAmount) external view returns (uint256) {
        _usdAmount = _usdAmount * (10 ** 18);
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 usdAmountInEth = divider(_usdAmount, ethPrice, 18);
        return usdAmountInEth;
    }

    function donate() public payable {
        require(msg.sender != i_owner, "Owner is already a donator");
        require(getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        if (!s_addressToRegistered[msg.sender]) {
            s_totalDonators++;
            s_addressToRegistered[msg.sender] = true;
            s_donators.push(msg.sender);
        }
        s_totalDonations += msg.value;
        s_addressToAmount[msg.sender] += msg.value;
        s_idToAddress[++s_entries] = msg.sender;
        emit DonationAccepted(msg.sender, msg.value);
    }

    function withdraw(address _donator, uint256 _amount) external payable returns(uint256) {
        require(msg.sender == i_owner || msg.sender == s_pickMe, "Not the owner");
        require(s_addressToAmount[_donator] >= _amount, "Can't withdraw more than donated amount!");
        s_addressToAmount[_donator] = s_addressToAmount[_donator] - _amount;
        payable(i_owner).transfer(_amount);
        return _amount;
    }

    /* getter functions */

    function getDonator(uint256 _index) external view returns (address) {
        return s_donators[_index];
    }

    function getDonators() external view returns (uint256) {
        return s_totalDonators;
    }

    function getAddressToAmount(address _donator) external view returns (uint256) {
        return s_addressToAmount[_donator];
    }

    function getIdToAddress(uint256 id) external view returns (address) {
        return s_idToAddress[id];
    }

    function getEntries() external view returns (uint256) {
        return s_entries;
    }

    /* setter functions */

     function setAddress(address _addressDonate) external { 
        s_pickMe = _addressDonate;
    }

    function setLotteryAddress(address _addressDonate) external { 
        s_dlottery = _addressDonate;
    }

    function resetEntries() external {
        require(msg.sender == i_owner || msg.sender == s_dlottery, "Not the owner");
        s_entries = 0;
    }

}