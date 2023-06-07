// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface cToken is IERC20 {
    function supply(address asset, uint amount) external;

    function withdraw(address asset, uint amount) external;

    function getUtilization() external returns (uint256);

    function getSupplyRate(uint utilization) external returns (uint64);

    function supplyRatePerBlock() external returns (uint);

    // function exchangeRateCurrent() external view returns (uint256);

    // function redeem(uint redeemTokens) external returns (uint);

    // function redeemUnderlying(uint redeemAmount) external returns (uint);

    // function underlying() external view returns (address);

    // function balanceOfUnderlying(address owner) external view returns (uint);
}
