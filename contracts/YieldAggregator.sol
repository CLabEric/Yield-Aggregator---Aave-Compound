// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/cToken.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IWETH.sol";
import "hardhat/console.sol";

contract YieldAggregator {
    IPool aavePool;

    IWETH weth;

    cToken cWeth;

    enum Protocol {
        NONE,
        AAVE,
        COMPOUND
    }

    uint256 public amountDeposited;

    Protocol public currentProtocol;

    // event GotCompoundUtilization(uint256 indexed _utilization);

    constructor(address _aave, address _weth, address _cWeth) {
        aavePool = IPool(_aave);
        weth = IWETH(_weth);
        cWeth = cToken(_cWeth);
    }

    function deposit(uint256 _amount) external {
        amountDeposited += _amount;
        uint256 aaveApy = getAaveAPR();
        uint256 compoundApy = getCompoundAPR();
        console.log("aaveApy", aaveApy);
        console.log("compoundApy", compoundApy);

        weth.transferFrom(msg.sender, address(this), _amount);

        if (aaveApy >= compoundApy) {
            currentProtocol = Protocol.AAVE;
            _depositAave(_amount);
        } else {
            currentProtocol = Protocol.COMPOUND;
            _depositCompound(_amount);
        }
    }

    function rebalance() external {}

    function withdraw(uint256 _amount) external {
        amountDeposited -= _amount;

        _withdrawAave(_amount);
        // _withdrawCompound(_amount);
    }

    function getAaveAPR() public view returns (uint256 depositAPR) {
        uint256 currentLiquidityRate = uint256(
            aavePool.getReserveData(address(weth)).currentLiquidityRate
        );

        // uint256 currentLiquidityRate = uint256(
        //     reserveData.currentLiquidityRate
        // );
        uint256 ray = 10 ** 23;
        depositAPR = (currentLiquidityRate) / ray;
    }

    function getCompoundAPR() public returns (uint256 depositAPR) {
        uint256 ethMantissa = 10 ** 18;
        uint256 secondsPerYear = 60 * 60 * 24 * 365;
        uint256 utilization = cWeth.getUtilization();
        uint64 supplyRate = cWeth.getSupplyRate(utilization);
        uint256 supplyRate2 = uint256(supplyRate);
        // console.log((supplyRate2 * secondsPerYear * 10000) / ethMantissa);
        depositAPR = (supplyRate2 * secondsPerYear * 10000) / ethMantissa;
    }

    function _depositAave(uint256 _amount) internal {
        weth.approve(address(aavePool), _amount);
        aavePool.supply(address(weth), _amount, msg.sender, 0);
    }

    function _depositCompound(uint256 _amount) internal {
        weth.approve(address(cWeth), _amount);
        cWeth.supply(address(weth), _amount);

        uint256 _cWethBalance = cWeth.balanceOf(address(this));
        cWeth.transfer(msg.sender, _cWethBalance);
    }

    function _withdrawAave(uint256 _amount) internal {
        aavePool.withdraw(address(weth), _amount, address(this));
        // weth.transfer(msg.sender, _amount);
    }

    function _withdrawCompound(uint256 _amount) internal {
        cWeth.withdraw(address(weth), _amount);
        weth.transfer(msg.sender, _amount);
    }

    fallback() external payable {}
}
