import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";

const main = async () => {
  const Proposal = await ethers.getContractFactory(
    "TokenProposalTransfersEnable"
  );
  const proposal = await Proposal.deploy({ gasPrice: process.env.GASP_PRICE });
  console.log(`Deployed to ${proposal.address}`);
};

main();
