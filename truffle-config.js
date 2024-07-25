require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

// Account credentials from which our contract will be deployed
const mnemonic = process.env.MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    sepolia: {
      provider: function() {
        return new HDWalletProvider({
          mnemonic,
          providerOrUrl: `https://sepolia.infura.io/v3/9f62baa113324c81a60538a4cf6efa28`, //infura rpc
          // providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/snQPB7IgiKvgHqSgjLKUdg40RLhjLDRV`, //alchemy rpc
          numberOfRetries: 5, // Tambahkan retry mechanism
          pollingInterval: 8000 // Interval polling
        });
      },
      network_id: 11155111, // network ID untuk Sepolia
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 11155111,
      networkCheckTimeout: 2000000 // Tingkatkan networkCheckTimeout
    }
  },
  compilers: {
    solc: {
      version: "^0.8.9",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: etherscanApiKey
  }
};