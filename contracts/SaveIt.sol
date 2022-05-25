// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SaveIt is Ownable {
    // donate variables
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

    // pickup variables
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


    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = payable(msg.sender);
        s_totalDonators = 0;
        s_totalDonations = 0;
        s_entries = 0;
        i_numOfFoodPlaces = 0;
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

    function getUsdAmountInEth(uint256 _usdAmount) public view returns (uint256) {
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

    // function withdraw(address _donator, uint256 _amount) public payable returns(uint256) {
    //     require(msg.sender == i_owner /* || msg.sender == s_pickMe */, "Not the owner");
    //     require(s_addressToAmount[_donator] >= _amount, "Can't withdraw more than donated amount!");
    //     s_addressToAmount[_donator] = s_addressToAmount[_donator] - _amount;
    //     payable(i_owner).transfer(_amount);
    //     return _amount;
    // }

    /* getter functions */

    function getDonator(uint256 _index) public view returns (address) {
        return s_donators[_index];
    }

    function getDonators() public view returns (uint256) {
        return s_totalDonators;
    }

    function getAddressToAmount(address _donator) public view returns (uint256) {
        return s_addressToAmount[_donator];
    }

    function getIdToAddress(uint256 id) public view returns (address) {
        return s_idToAddress[id];
    }

    function fundDelivery() internal {
        require(s_deliveryRequests.length > 0, "No pending requests");
        Request memory request;
        uint256 requests = s_deliveryRequests.length;
        uint256 cost = 25 * requests; // placeholder value for funding a delivery request
        // uint256 balance = address(donate).balance;
        uint256 i = 0;
        uint256 withdrawn = 0;
        cost = getUsdAmountInEth(cost);
        // balance = donate.getUsdAmountInEth(balance);
        // require(
        //     balance >= donate.getUsdAmountInEth(25),
        //     "Insufficient funds"
        // );
        for (uint k = 0; k < requests; k++) {
            request = s_deliveryRequests[0];
            while (cost > 0) {
                address donator = getDonator(i);
                uint amount = getAddressToAmount(donator);
                if (amount > 0) {
                    if (amount >= cost) {
                        // withdrawn = uint(withdraw(donator, cost));
                        // if (s_addressToAmount[donator] >= amount) {
                        // }
                        withdrawn = cost;
                        s_addressToAmount[donator] = s_addressToAmount[donator] - amount;
                        payable(i_owner).transfer(amount);
                    }
                    if (amount < cost) {
                        // withdrawn = uint(withdraw(donator, amount));
                        withdrawn = amount;
                        s_addressToAmount[donator] = s_addressToAmount[donator] - amount;
                        payable(i_owner).transfer(amount);
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
    // function getEntries() external view returns (uint256) {
    //     return s_entries;
    // }

    /* setter functions */

    // function setAddress(address _addressDonate) external { 
    //     s_pickMe = _addressDonate;
    // }

    // function setLotteryAddress(address _addressDonate) external { 
    //     s_dlottery = _addressDonate;
    // }

    // function resetEntries() external {
    //     require(msg.sender == i_owner || msg.sender == s_dlottery, "Not the owner");
    //     s_entries = 0;
    // }


    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
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
        fundDelivery();
        // trigger an event for the new delivery request
        emit NewRequest(msg.sender, _amountInKG);
    }


    /* setter functions */
    // function setAddress(address _addressDonate) external {
    //     s_donate = _addressDonate;
    // }

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