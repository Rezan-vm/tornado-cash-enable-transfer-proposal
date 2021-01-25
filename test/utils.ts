//SPDX-License-Identifier: MIT

import hre, { ethers } from "hardhat";

export const advanceTime = async (sec: number) => {
  const now = (await ethers.provider.getBlock("latest")).timestamp;
  await ethers.provider.send("evm_setNextBlockTimestamp", [now + sec]);
};

export const getSignerFromAddress = async (address: string) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  return await ethers.provider.getSigner(address);
};
