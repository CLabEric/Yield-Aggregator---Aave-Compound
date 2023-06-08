// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface cToken {
    function supply(address asset, uint amount) external;

    function withdraw(address asset, uint amount) external;

    function getUtilization() external returns (uint256);

    function getSupplyRate(uint utilization) external returns (uint64);

    function supplyRatePerBlock() external returns (uint);

    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(address dst, uint amount) external returns (bool);

    function transferFrom(
        address src,
        address dst,
        uint amount
    ) external returns (bool);

    // function exchangeRateCurrent() external view returns (uint256);

    // function redeem(uint redeemTokens) external returns (uint);

    // function redeemUnderlying(uint redeemAmount) external returns (uint);

    // function underlying() external view returns (address);

    // function balanceOfUnderlying(address owner) external view returns (uint);

    function withdrawTo(address to, address asset, uint amount) external;

    function withdrawFrom(
        address src,
        address to,
        address asset,
        uint amount
    ) external;

    function approveThis(address manager, address asset, uint amount) external;

    function withdrawReserves(address to, uint amount) external;

    function balanceOf(address owner) external view returns (uint256);
}
