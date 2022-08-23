const lotteryinfo = {
  address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "vrfCoordinatorV2",
          type: "address",
        },
        {
          internalType: "uint64",
          name: "subscriptionId",
          type: "uint64",
        },
        {
          internalType: "bytes32",
          name: "gasLane",
          type: "bytes32",
        },
        {
          internalType: "uint256",
          name: "interval",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "callbackGasLimit",
          type: "uint32",
        },
        {
          internalType: "address",
          name: "donateAddress",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "Lottery__TransferFailed",
      type: "error",
    },
    {
      inputs: [],
      name: "Lottery__UpkeepNotNeeded",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "have",
          type: "address",
        },
        {
          internalType: "address",
          name: "want",
          type: "address",
        },
      ],
      name: "OnlyCoordinatorCanFulfill",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "LotteryEnter",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
      ],
      name: "RequestedLotteryWinner",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "WinnerPicked",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getInterval",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLastTimeStamp",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getLotteryState",
      outputs: [
        {
          internalType: "enum Lottery.LotteryState",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getNumWords",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "getRecentWinner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getRequestConfirmations",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          internalType: "uint256[]",
          name: "randomWords",
          type: "uint256[]",
        },
      ],
      name: "rawFulfillRandomWords",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "s_donate",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "setDonateAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
}

export default lotteryinfo
