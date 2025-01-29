require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

// Account credentials from which our contract will be deployed
const mnemonic = process.env.MNEMONIC; // Wallet Deployer
const infuraApiKey = process.env.INFURA_API_KEY; // Infura RPC
const alchemyApiKey = process.env.ALCHEMY_API_KEY; // Alchemy RPC
const etherscanApiKey = process.env.ETHERSCAN_API_KEY; //Etherscan API

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
          // providerOrUrl: `https://sepolia.infura.io/v3/${infuraApiKey}`, // Infura RPC
          providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`, // Alchemy RPC
          numberOfRetries: 5,
          pollingInterval: 8000
        });
      },
      network_id: 11155111, // Sepolia Network Id
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 11155111,
      networkCheckTimeout: 2000000 
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