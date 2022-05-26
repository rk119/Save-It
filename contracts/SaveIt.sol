// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

error Lottery__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 lotteryState
);
error Lottery__TransferFailed();
error Lottery__SendMoreToEnterLottery();
error Lottery__LotteryNotOpen();

contract SaveIt is Ownable, VRFConsumerBaseV2, KeeperCompatibleInterface {
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
    event DonatorRegistered(
        uint256 amount,
        string name,
        string latitude,
        string longitude
    );
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

    // dlottery variables
    enum LotteryState {
        OPEN,
        CALCULATING
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    string private s_winnersFood;
    uint256 private i_numOfFoodies;
    address private s_currentWinner;
    uint256 private i_entranceFee;
    Foodie[] private s_foodies;
    LotteryState private s_lotteryState;

    event RequestedLotteryWinner(uint256 indexed requestId);
    event LotteryEnter(address indexed player);
    event WinnerPicked(address indexed player);
    event newFoodieAdded(string food);

    struct Foodie {
        string food;
        address owner;
    }

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit,
        address _priceFeed
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = payable(msg.sender);
        s_totalDonators = 0;
        s_totalDonations = 0;
        s_entries = 0;
        i_numOfFoodPlaces = 0;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_interval = interval;
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_callbackGasLimit = callbackGasLimit;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getPrice(AggregatorV3Interface _priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 answer, , , ) = _priceFeed.latestRoundData();
        return uint256(answer * 10000000000);
    }

    function getConversionRate(uint256 _ethAmount)
        public
        view
        returns (uint256)
    {
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 ethAmountInUsd = (ethPrice * _ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }

    function divider(
        uint numerator,
        uint denominator,
        uint precision
    ) internal pure returns (uint) {
        return (numerator * (uint(10)**uint(precision))) / denominator;
    }

    function getUsdAmountInEth(uint256 _usdAmount)
        public
        view
        returns (uint256)
    {
        _usdAmount = _usdAmount * (10**18);
        uint256 ethPrice = getPrice(s_priceFeed);
        uint256 usdAmountInEth = divider(_usdAmount, ethPrice, 18);
        return usdAmountInEth;
    }

    function donate() public payable {
        require(msg.sender != i_owner, "Owner is already a donator");
        require(
            getConversionRate(msg.value) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        if (!s_addressToRegistered[msg.sender]) {
            s_totalDonators++;
            s_addressToRegistered[msg.sender] = true;
            s_donators.push(msg.sender);
        }
        s_totalDonations++;
        s_addressToAmount[msg.sender] += msg.value;
        s_idToAddress[++s_entries] = msg.sender;
        emit DonationAccepted(msg.sender, msg.value);
    }

    /* getter functions */

    function getDonator(uint256 _index) public view returns (address) {
        return s_donators[_index];
    }

    function getDonators() public view returns (uint256) {
        return s_totalDonators;
    }

    function getAddressToAmount(address _donator)
        public
        view
        returns (uint256)
    {
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
                        s_addressToAmount[donator] =
                            s_addressToAmount[donator] -
                            amount;
                        payable(i_owner).transfer(amount);
                    }
                    if (amount < cost) {
                        // withdrawn = uint(withdraw(donator, amount));
                        withdrawn = amount;
                        s_addressToAmount[donator] =
                            s_addressToAmount[donator] -
                            amount;
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

    function getEntries() public view returns (uint256) {
        return s_entries;
    }

    /* setter functions */

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
        // fundDelivery();
        // trigger an event for the new delivery request
        emit NewRequest(msg.sender, _amountInKG);
    }

    /* setter functions */

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

    function addFoodie(string memory _food) public {
        s_foodies.push(Foodie(_food, msg.sender));
        i_numOfFoodies++;
        emit newFoodieAdded(_food);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = LotteryState.OPEN == s_lotteryState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_totalDonations > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
        if (!upkeepNeeded) {
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_totalDonations,
                uint256(s_lotteryState)
            );
        }
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % getEntries();
        address recentWinner = getIdToAddress(indexOfWinner);
        s_recentWinner = recentWinner;
        // resetEntries();
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        // (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require(success, "Transfer failed");
        // if (!success) {
        //     revert Lottery__TransferFailed();
        // }
        emit WinnerPicked(recentWinner);
    }

    // temporary pick a winner function for testing
    function pickAWinner() public {
        if (s_totalDonations > 0) {
            uint256 indexOfWinner = random(s_totalDonators);
            address recentWinner = s_donators[indexOfWinner];
            s_recentWinner = recentWinner;
            selectFood();
            // resetEntries();
            s_lotteryState = LotteryState.OPEN;
            s_lastTimeStamp = block.timestamp;
        }
    }

    function selectFood() public {
        uint size = s_foodies.length;
        if (size > 0) {
            uint256 indexOfFoodie = random(size);
            Foodie memory foodie = s_foodies[indexOfFoodie];
            s_winnersFood = foodie.food;
        }
    }
    // temporary random function for testing
    function random(uint arraySize) internal view returns (uint) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
        return randomHash % arraySize;
    }


    /** Getter Functions */

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getWinnersFood() public view returns (string memory) {
        return s_winnersFood;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getNumberOfFoodies() public view returns (uint256) {
        return i_numOfFoodies;
    }
}
