//SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface ITorn {
    function changeTransferability(bool decision) external;
}

contract TokenProposalTransfersEnable {
    function executeProposal() public {
        ITorn torn = ITorn(0x77777FeDdddFfC19Ff86DB637967013e6C6A116C);
        torn.changeTransferability(true);
    }
}
