<p align="center">
  <img src="./img/logo.png" width="130" /> <h1 align="center"> Save It </h1>
</p>

## Intro: What is SaveIt?
On a daily basis, food in many restaurants are often thrown out in large quantities, which results in immense food wastage. More than 40% of food is wasted in the US alone, the numbers globally are frightening. What if this food could be used before it expires? That's where **Save It** comes in. **Save It** allows food companies to donate their unsold food before it expires. This food will be transported and distributed to people in need and donators can fund these transportion and services with ETH!

---

## Setup: How to run the app
Git clone the project by running the following command in your terminal
```
git clone https://github.com/rk119/Save-It
```

Once this is complete, change directory into the Save-It directory and install all the necessary dependencies. The package manager we used is yarn but any package manager will do.
```bash
yarn
```

Make sure all the solidity files have been compiled and then run the local blockchain

```
yarn hardhat compile

yarn hardhat node
```

Upon running the local blockchain, the smart contracts should be deployed. Copy the address to which SaveIt was deployed to and paste it in src/contractinfo/addresses.js

Start up the app with the following command
```
yarn start
```

Ensure the network is set to the local host on metamask.

---

## Chainlink services used in the project

1. Data Feeds
2. Verifiable Random Function
3. Keepers

---

## Our goal
We recognize the persisting global issue of food wastage and the potential that blockchain technology has for providing the reassurance that an action taken will be seen through till the end. Every small food donation made will truly have an influence in reducing food wastage.
