// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./Donate.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "hardhat/console.sol";

error DLottery__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 lotteryState
);
error DLottery__TransferFailed();
error DLottery__SendMoreToEnterLottery();
error DLottery__LotteryNotOpen();

contract DLottery is VRFConsumerBaseV2, KeeperCompatibleInterface {

    event RequestedLotteryWinner(uint256 indexed requestId);
    event LotteryEnter(address indexed donators);
    event WinnerPicked(address indexed donator);
    event newFoodieAdded(string food);

    enum LotteryState {
        PREVIOUS_WINNER,
        NEW_WINNER
    }
    LotteryState public lotteryState;

    struct Foodie {
        string food;
        address owner;
    }

    /* Variables */
    string public name;
    uint256 private lotteryInterval = 30 days; // 2592000 or 30*24*60*60

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Variables
    Foodie[] private foodies;
    address[] private s_donators; // need to get donator data from donate
    // address payable[] private s_donators;
    uint256 private s_lastTimeStamp;
    address private s_previousWinner;
    address private s_currentWinner;
    LotteryState private s_lotteryState;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.PREVIOUS_WINNER;
        s_lastTimeStamp = block.timestamp;
        name = "DLottery";
    }

    // should only be called by the owner
    function addFoodie(string memory _food) public {
        foodies.push(Foodie(_food, msg.sender));
        emit newFoodieAdded(_food);
    }

    address[] private donators;
    uint256[] private donations;

    function fund(uint256 amount) public {
        donations.push(amount);
        donators.push(msg.sender);
        s_donators.push(msg.sender);
    }

    // executes off-chain to check if upkeep is necessary
    function checkUpkeep(bytes memory /* checkData */)
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = LotteryState.PREVIOUS_WINNER == s_lotteryState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > lotteryInterval);
        bool hasDonators = s_donators.length > 0;
        upkeepNeeded = (isOpen && timePassed && hasDonators);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert DLottery__UpkeepNotNeeded(
                address(this).balance,
                s_donators.length,
                uint256(s_lotteryState)
            );
        }
        s_lotteryState = LotteryState.NEW_WINNER;
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
        s_previousWinner = s_currentWinner;
        // select a random winner
        uint256 indexOfWinner = randomWords[0] % s_donators.length;
        address winner = s_donators[indexOfWinner];
        s_currentWinner = winner;
        // reset the lottery
        s_donators = new address[](0);
        s_lotteryState = LotteryState.PREVIOUS_WINNER;
        s_lastTimeStamp = block.timestamp;
        // the selected winner gets awarded free food!!!
        indexOfWinner = randomWords[0] % foodies.length;
        Foodie memory foodie = foodies[indexOfWinner];
        foodie.owner = winner;
        bool success = (foodie.owner == winner);
        if (!success) {
            revert DLottery__TransferFailed();
        }
        emit WinnerPicked(winner);
    }

    /**Setter Functions */
    function setInterval(uint256 _interval) public {
        lotteryInterval = _interval;
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

    function getCurrentWinner() public view returns (address) {
        return s_currentWinner;
    }

    function getPreviousWinner() public view returns (address) {
        return s_previousWinner;
    }

    function getDonator(uint256 index) public view returns (address) {
        return s_donators[index];
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return lotteryInterval;
    }

    function getNumberOfDonators() public view returns (uint256) {
        return s_donators.length;
    }

    function getNumberOfFoodies() public view returns (uint256) {
        return foodies.length;
    }
}
