// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./Donate.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

error DLottery__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 lotteryState
);
error DLottery__TransferFailed();
error DLottery__SendMoreToEnterRaffle();
error DLottery__RaffleNotOpen();

/*
errors
state variables
constructor
check upkeep
perform upkeep
fullfill random words
getter functions
*/

contract DLottery is VRFConsumerBaseV2, KeeperCompatibleInterface {

    event RequestedLotteryWinner(uint256 indexed requestId);
    event LotteryEnter(address indexed player);
    event WinnerPicked(address indexed player);

    enum LotteryState {
        PREVIOUS_WINNER,
        NEW_WINNER
    }
    LotteryState public lotteryState;

    struct Foodie {
        string food;
        address owner;
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Variables
    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;
    address private s_previousWinner;
    address private s_currentWinner;
    uint256 private i_entranceFee;
    address payable[] private s_donators;
    // address[] private s_donators;
    LotteryState private s_lotteryState;
    // the monthly free food
    Foodie[] private foodies;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_interval = interval;
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        s_lotteryState = LotteryState.PREVIOUS_WINNER;
        s_lastTimeStamp = block.timestamp;
        i_callbackGasLimit = callbackGasLimit;
    }

    // should only be called by the owner
    function addFoodie(string memory _foodie) public {
        foodies.push(Foodie(_foodie, msg.sender));
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
        bool isOpen = LotteryState.PREVIOUS_WINNER == s_lotteryState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_donators.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); // can we comment this out?
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
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
        address payable winner = s_donators[indexOfWinner]; // change payable
        s_currentWinner = winner;
        // reset the lottery
        s_donators = new address payable[](0);
        s_lotteryState = LotteryState.PREVIOUS_WINNER;
        s_lastTimeStamp = block.timestamp;
        // the selected winner gets awarded free food!!!
        // will add randomization on the food so the winner 
        // gets random food from a predefined selection
        indexOfWinner = randomWords[0] % foodies.length;
        Foodie memory foodie = foodies[indexOfWinner];
        foodie.owner = winner;
        // (bool success, ) = winner.call{value: address(this).balance}("");
        // if (!success) {
        //     revert DLottery__TransferFailed();
        // }
        emit WinnerPicked(winner);
    }

    /** Getter Functions */

    function getRaffleState() public view returns (LotteryState) {
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

    function getPlayer(uint256 index) public view returns (address) {
        return s_donators[index];
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_donators.length;
    }
}
