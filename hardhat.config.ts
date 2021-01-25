import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ETH_RPC_MAINNET,
        blockNumber: 11720000,
      },
    },
    mainnet: {
      url: process.env.ETH_RPC_MAINNET,
      accounts: [process.env.PRIV_KEY],
    },
  },
};

export default config;
