// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Donate.sol";

contract Delivery is Ownable {
    mapping(address => uint256) public s_addressToDonation;
    address[] public s_foodonors; // "food donors"
    address public immutable i_owner;
    address public s_donate;

    constructor(address _donateAddress) {
        i_owner = msg.sender;
        s_donate = _donateAddress;
    }

    function requestDelivery(uint256 _amountInKG) public {
        require(_amountInKG > 5, "You need to donate more food!");
        s_addressToDonation[msg.sender] += _amountInKG;
        s_foodonors.push(msg.sender);
        Donate(s_donate).fund();
    }

    function getFoodonor(uint256 _index) public view returns (address) {
        return s_foodonors[_index];
    }

    function getFoodonors() public view returns (uint256) {
        return s_foodonors.length;
    }

    function getFoodDonation(address _foodonor) public view returns (uint256) {
        return s_addressToDonation[_foodonor];
    }

    function setDonateAddress(address _address) public onlyOwner {
        s_donate = _address;
    }
}
