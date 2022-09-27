import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
dotenv.config();

module.exports = {
  //Specifing Aurora Testnet network for smart contract deploying
  networks: {
    testnet_aurora: {
      url: "https://testnet.aurora.dev",
      accounts: [
        `fb57cdb52c16a26a9f54d37ce8f106bc4a334772d5c376c08f009e042cb0a7fe`,
      ],
      chainId: 1313161555,
      gasPrice: 100000000,
    },
  },
  //Specifing Solidity compiler version
  solidity: {
    compilers: [
      {
        version: "0.7.6",
      },
      {
        version: "0.8.6",
      },
    ],
  },
  //Specifing Account to choose for deploying
  namedAccounts: {
    deployer: 0,
  },
};
