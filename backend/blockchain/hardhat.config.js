require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.20",
    networks: {
        amoy: {
            url: process.env.ALCHEMY_RPC_URL,
            accounts: [process.env.WALLET_PRIVATE_KEY],
        },
    },
};