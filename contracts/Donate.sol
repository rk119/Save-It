// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Converter.sol";

contract Donate is Ownable {
    mapping(address => uint256) public s_donations;
    address[] public s_donators; // "ETH donators"
    address public immutable i_owner;
    address public s_converter;
    address public s_delivery;
    uint256 public constant MIN_USD = 10 * 10 ** 18; // minimum donation amount
    bool private success = false;

    constructor(address _converterAddress) {
        i_owner = msg.sender;
        s_converter = _converterAddress;
    }

    function donate() public payable {
        uint256 amount = Converter(s_converter).ethToUSD(msg.value);
        require(amount >= MIN_USD, "You need to spend more ETH!");
        s_donations[msg.sender] += msg.value;
        s_donators.push(msg.sender);
    }

    function getDonator(uint256 _index) public view returns (address) {
        return s_donators[_index];
    }

    function getDonators() public view returns (uint256) {
        return s_donators.length;
    }

    function fund() public returns (bool) {
        require(msg.sender == s_delivery, "You are not the owner.");
        uint256 cost = Converter(s_converter).usdToETH(25);
        uint balance = address(this).balance;
        if (balance < cost) return false;
        
        address[] memory d = s_donators;
        uint i = 0; uint withdrawn = 0; uint transfer = 0;
        while (cost > 0) {
            address donator = d[i];
            uint amount = s_donations[donator];
            if (amount > 0) {
                if (amount < cost)
                    withdrawn = amount;
                else
                    withdrawn = cost;
            }
            transfer += withdrawn;
            s_donations[donator] -= withdrawn;
            cost -= withdrawn;
            i++;
        }
        (success, ) = i_owner.call{value: transfer}("");
        require(success);
        return true;
    }

    function donators() public view returns (address[] memory) {
        return s_donators;
    }

    function setConverterAddress(address _address) public onlyOwner {
        s_converter = _address;
    }

    function setDeliveryAddress(address _address) public onlyOwner {
        s_delivery = _address;
    }
}
