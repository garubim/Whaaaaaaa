import dotenv from 'dotenv';

// Minimal ESM Hardhat config that mirrors hardhat.config.cjs
dotenv.config();

export default {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: '0.8.20',
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: '0.8.17',
        settings: { optimizer: { enabled: true, runs: 200 } },
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
  mocha: { timeout: 200000 },
};
