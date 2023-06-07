const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Yield Aggregator Tests", function () {

    //   let user;
    const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const SOME_GUY = "0x741AA7CFB2c7bF2A1E7D4dA2e3Df6a56cA4131F3";
    const ONE_HUNDRED_WETH = ethers.utils.parseUnits("100");

    const AAVE_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
    const AWETH = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8";

    const CWETH = "0xA17581A9E3356d9A858b789D68B4d866e593aE94";

    before( async () => {
        [user] = await ethers.getSigners();

        // initialize weth contract
        this.weth = await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            WETH,
            user
        );

        // initialize aWETH contract
        this.aWeth = await hre.ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            AWETH,
            user
        );

        // initialize cWeth contract
        this.cWeth = await hre.ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            CWETH,
            user
        );

        // Impersonate random holder and get some of their weth
        this.someGuy = await ethers.getImpersonatedSigner(SOME_GUY);
        await this.weth.connect(this.someGuy).transfer(user.address, ONE_HUNDRED_WETH);

        // initialize our aggregator contract
        const YieldAggregatorFactory = await ethers.getContractFactory(
            'contracts/YieldAggregator.sol:YieldAggregator', 
            user
        );
        this.yieldAggregator = await YieldAggregatorFactory.deploy(AAVE_POOL, WETH, CWETH);

    });

    describe("Setup tasks", async () => {

        it("User should have 100 WETH", async () => {
            expect(await this.weth.balanceOf(user.address)).to.be.equal(ONE_HUNDRED_WETH);
        });

    });

    describe("Contract interaction tasks", async () => {

        it("Deposit function should work", async () => {
            // console.log(await ethers.providers.getNetwork());
            const initialCWethBalance = await this.cWeth.balanceOf(user.address);

            await this.weth.connect(user).approve(this.yieldAggregator.address, ONE_HUNDRED_WETH);
            await this.yieldAggregator.connect(user).deposit(ONE_HUNDRED_WETH);

            // const d = await this.yieldAggregator.callStatic.getCompoundAPR();
            // console.log();

            expect(await this.aWeth.balanceOf(user.address)).to.be.equal(ONE_HUNDRED_WETH);

            // expect(await this.cWeth.balanceOf(this.yieldAggregator.address)).to.be.gt(initialCWethBalance);
            expect(await this.weth.balanceOf(user.address)).to.be.equal(0);
        });

        it("Withdraw function should work", async () => {
            console.log(await this.aWeth.balanceOf(user.address));
            await this.aWeth.transfer(this.yieldAggregator.address, await this.aWeth.balanceOf(user.address));
            await this.yieldAggregator.connect(user).withdraw(ONE_HUNDRED_WETH);

            // expect(await this.aWeth.balanceOf(user.address)).to.be.lt(ONE_HUNDRED_WETH);
            // expect(await this.weth.balanceOf(user.address)).to.be.equal(ONE_HUNDRED_WETH);

        });

    });

});


// def get_compound_apy():

//     ctoken_contract = interface.CErc20(cDai)

//     supplyRate = ctoken_contract.supplyRatePerBlock.call()

//     eth_Mantissa =10 ** 18 
//     blocks_per_Day = 6570
//     days_in_Year = 365

//     depositAPY = ((((supplyRate / eth_Mantissa * blocks_per_Day + 1) ** days_in_Year)) - 1) * 100

//     print("compound deposit apy is: ", depositAPY)