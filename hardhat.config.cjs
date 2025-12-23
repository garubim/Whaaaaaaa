require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');
// use the new verify plugin from nomicfoundation
require('@nomicfoundation/hardhat-verify');
// Allow overriding optimizer via env for verification repros
const optimizerEnabled = process.env.DISABLE_OPTIMIZER === 'true' ? false : true;
/*******************************************************************************
 * Minimal Hardhat config for this workspace
 * - Uses solidity ^0.8.19 (matching contracts)
 * - Reads RPC and PRIVATE_KEY from env for optional networks
 ******************************************************************************/

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: { enabled: optimizerEnabled, runs: 200 },
        },
      },
      {
        version: '0.8.20',
        settings: {
          optimizer: { enabled: optimizerEnabled, runs: 200 },
        },
      },
      {
        version: '0.8.17',
        settings: {
          optimizer: { enabled: optimizerEnabled, runs: 200 },
        },
      },
    ],
  },
  networks: (() => {
    const nets = {};
    if (process.env.RPC_URL) {
      nets.base = {
        url: process.env.RPC_URL,
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      };
    }
    return nets;
  })(),
  mocha: {
    timeout: 200000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ''
  }
};

