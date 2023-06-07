require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: __dirname + '/.env' });

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

const MAINNET_FORK_BLOCK_NUMBER = 17394258;
// const MAINNET_FORK_BLOCK_NUMBER = 17406012;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET,
        blockNumber: MAINNET_FORK_BLOCK_NUMBER,
      },
    },
  }
};
