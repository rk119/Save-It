export default {
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "FoodPlaceRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "donator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "donation",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "foodPlaceId",
          type: "uint256",
        },
      ],
      name: "NotifyDonator",
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
          indexed: false,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amountInGrams",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "requestId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "address",
          name: "requester",
          type: "address",
        },
      ],
      name: "Request",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_amountInGrams",
          type: "uint256",
        },
      ],
      name: "calculateCost",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "fundDelivery",
      outputs: [],
      stateMutability: "nonpayable",
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
          internalType: "string",
          name: "_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "_latitude",
          type: "string",
        },
        {
          internalType: "string",
          name: "_longitude",
          type: "string",
        },
      ],
      name: "registerFoodPlace",
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
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_amountInGrams",
          type: "uint256",
        },
      ],
      name: "requestDelivery",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "s_foodPlaceId",
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
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "s_foodPlaces",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "latitude",
          type: "string",
        },
        {
          internalType: "string",
          name: "longitude",
          type: "string",
        },
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "s_requestId",
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
      inputs: [
        {
          internalType: "address",
          name: "_addressDonate",
          type: "address",
        },
      ],
      name: "setAddress",
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