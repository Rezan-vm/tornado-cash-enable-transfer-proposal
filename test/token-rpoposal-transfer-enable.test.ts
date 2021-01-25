//SPDX-License-Identifier: MIT

import "@nomiclabs/hardhat-waffle";
import { expect } from "chai";
import hre, { ethers, waffle } from "hardhat";
import GovernanceAbi from "../contracts/external/governance";
import TornAbi from "../contracts/external/torn";
import { advanceTime, getSignerFromAddress } from "./utils";

describe("Enable transfer proposal", () => {
  const dummyAddress = "0x0000000000000000000000000000000000000001";
  const tornWhale = "0x5f48c2a71b2cc96e3f0ccae4e39318ff0dc375b2";
  const smallTornHolder = "0xbBB1199528a0F5DAB92A3fA5BA424C4f0e1A6807";
  const tornToken = "0x77777FeDdddFfC19Ff86DB637967013e6C6A116C";
  const governanceAddress = "0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce";

  const torn25k = ethers.utils.parseEther("25000");

  it("Should execute proposal and allow transfers", async () => {
    // Proposal contract
    const Proposal = await ethers.getContractFactory(
      "TokenProposalTransfersEnable"
    );

    // Get Tornado governance contract
    let governance = await ethers.getContractAt(
      GovernanceAbi,
      governanceAddress
    );

    await expect(await governance.proposalCount()).equal(0);

    // Get TORN token contract
    let torn = await ethers.getContractAt(TornAbi, tornToken);

    // Set the current date as the date TORN transfers can be enabled (01.02.2021)
    await ethers.provider.send("evm_setNextBlockTimestamp", [
      (await torn.canUnpauseAfter()).toNumber(),
    ]);

    // TORN transfer are currently failing
    await expect(
      torn
        .connect(await getSignerFromAddress(smallTornHolder))
        .transfer(dummyAddress, "1")
    ).to.be.revertedWith("TORN: paused");

    // Impersonate a TORN whale and a small holder.
    // We use one of the team vesting contract with 800k+ TORN that
    // we will use like if it was an EOA.
    const tornWhaleSigner = await getSignerFromAddress(tornWhale);
    torn = torn.connect(tornWhaleSigner);
    governance = governance.connect(tornWhaleSigner);

    // Lock TORN in governance
    await torn.approve(governance.address, torn25k, { gasPrice: 0 });
    await governance.lockWithApproval(torn25k, { gasPrice: 0 });

    // Deploy and send the proposal
    const proposal = await Proposal.deploy();
    await governance.propose(proposal.address, "Enable TORN transfers", {
      gasPrice: 0,
    });

    await expect(await governance.proposalCount()).equal(1);

    // Wait the voting delay and vote for the proposal
    await advanceTime((await governance.VOTING_DELAY()).toNumber() + 1);

    await governance.castVote(1, true, { gasPrice: 0 });

    // Wait voting period + execution delay
    await advanceTime(
      (await governance.VOTING_PERIOD()).toNumber() +
        (await governance.EXECUTION_DELAY()).toNumber()
    );

    // Execute the proposal
    await governance.execute(1, { gasPrice: 0 });

    // Test transfer again
    await torn
      .connect(await getSignerFromAddress(smallTornHolder))
      .transfer(dummyAddress, "1");
    expect(await torn.balanceOf(dummyAddress)).to.equal(1);
  });
});
