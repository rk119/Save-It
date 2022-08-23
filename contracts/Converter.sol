// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Converter {
    AggregatorV3Interface public s_priceFeed;

    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getPrice() internal view returns (uint256) {
        (, int256 answer, , , ) = s_priceFeed.latestRoundData();
        return uint256(answer * 10 ** 10);
    }

    // ETH to USD conversion
    function ethToUSD(uint256 _ethAmount)
        public view returns (uint256) {
        uint256 ethPrice = getPrice();
        return (ethPrice * _ethAmount) / (10**18);
    }

    // USD to ETH conversion
    function usdToETH(uint256 _usdAmount)
        public view returns (uint256) {
        _usdAmount = _usdAmount * (10**18);
        uint256 ethPrice = getPrice();
        return (_usdAmount / (ethPrice / (10**18)));
    }
}
