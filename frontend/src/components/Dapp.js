import React from "react";
import { ethers } from "ethers";

import YieldAggregatorArtifact from "../contracts/YieldAggregator.json";
import contractAddress from "../contracts/contract-address.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Aggregator } from "./Aggregator";
import { Loading } from "./Loading";

const HARDHAT_NETWORK_ID = '31337';

/**
 * Adapted from HH Boilerplate project. We initialize our YieldAggregator
 * contract then any external contracts. Then set up some initial state,
 * get some weth if we don't have any.
 * 
 * The main logic is in the Aggregator component
 * **/
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      aggregator: undefined,
      weth: undefined,
      aWeth: undefined,
      cWeth: undefined,
      protocol: undefined,
      aaveAPY: undefined,
      compoundAPY: undefined,
      wethBalance: undefined,
      deposited: undefined,

      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.aggregator) {
      return <Loading />;
    }

    return (
      <Aggregator 
        userAddress={ this.state.selectedAddress }
        aggregator={ this.state.aggregator }
        weth={ this.state.weth }
        aWeth={ this.state.aWeth }
        cWeth={ this.state.cWeth }
        protocol={ this.state.protocol }
        initAave={ this.state.aaveAPY }
        initCompound={ this.state.compoundAPY }
        wethBalance={ this.state.wethBalance }
        deposited={ this.state.deposited }
      />
    );
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    this._checkNetwork();

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {

      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
  }

  _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress,
    });

    this._initializeEthers();
    this._loadContracts(userAddress);
    this._getSomeWeth(userAddress);
    this._initializeRest();
  }

  async _initializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._YieldAggregator = new ethers.Contract(
      contractAddress.YieldAggregator,
      YieldAggregatorArtifact.abi,
      this._provider.getSigner(0)
    );

    this.setState({aggregator: this._YieldAggregator});
  }

  async _loadContracts(userAddress) {
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const AWETH_ADDRESS = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8";
    const CWETH_ADDRESS = "0xA17581A9E3356d9A858b789D68B4d866e593aE94";

    const WETH_ABI = [
      "function balanceOf(address account) external view returns (uint256)",
      "function deposit() external payable",
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    const AWETH_ABI = ["function balanceOf(address account) external view returns (uint256)"];
    const CWETH_ABI = ["function balanceOf(address account) external view returns (uint256)"];

    this._weth = new ethers.Contract(
      WETH_ADDRESS,
      WETH_ABI,
      this._provider.getSigner(0)
    );

    this._aWeth = new ethers.Contract(
      AWETH_ADDRESS,
      AWETH_ABI,
      this._provider.getSigner(0)
    );

    this._cWeth = new ethers.Contract(
      CWETH_ADDRESS,
      CWETH_ABI,
      this._provider.getSigner(0)
    );

    this.setState({weth: this._weth});
    this.setState({aWeth: this._aWeth});
    this.setState({cWeth: this._cWeth});
  }

  async _getSomeWeth(userAddress) {
    const wethBalance = await this._weth.balanceOf(userAddress);

    if (parseInt(wethBalance.toString()) > 0) {
      const formattedWethBalance = ethers.utils.formatEther( wethBalance.toString() );

      this.setState({wethBalance: formattedWethBalance});
      return;
    }

    const ethBalance = await this._provider.getBalance(userAddress);
    const halfEthBalance = ethBalance.div(2).toString();
    const wethDeposit = await this._weth.deposit({value: halfEthBalance});
    const formattedWethDeposit = ethers.utils.formatEther( wethDeposit.value.toString() );

    this.setState({wethBalance: formattedWethDeposit});
  }

  async _initializeRest() {
    const protocol = await this._YieldAggregator.currentProtocol();
    const aaveAPY = await this._YieldAggregator.getAaveAPR();
    const compoundAPY = await this._YieldAggregator.callStatic.getCompoundAPR();

    if ( protocol != 0 ) {
      const depositAmt = await this._YieldAggregator.amountDeposited();
      const formattedDeposit = ethers.utils.formatEther( depositAmt.toString() );

      this.setState({ deposited: formattedDeposit });
    }

    this.setState({ protocol });
    this.setState({ aaveAPY: aaveAPY.toString() });
    this.setState({ compoundAPY: compoundAPY.toString() });
  }


  /******************************************
  **** Below is boilerplate HardHat code ****
  *******************************************/

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
    }
  }
}
