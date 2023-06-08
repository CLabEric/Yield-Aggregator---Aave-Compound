import { useState } from 'react';
import { ethers } from "ethers";
import "./styles.css";

export const Aggregator = ({
    userAddress, aggregator, weth, aWeth, cWeth, protocol, initAave, initCompound, wethBalance, deposited 
}) => {
    const [amount, setAmount] = useState( '' );

    /** main methods */

    // takes input amount and sends it to our Yield Aggregator's 'deposit()' function
    const deposit = async (e) => {
        e.preventDefault();

        const formattedAmount = ethers.utils.parseUnits(amount).toString();

        await weth.approve(aggregator.address, formattedAmount);
        await aggregator.deposit( formattedAmount, {gasLimit: 500000} );
    };

    // calls our Yield Aggregator's 'rebalance()' function
    const rebalance = async (e) => {
        e.preventDefault();

        await aggregator.rebalance();
    };

    // calls our Yield Aggregator's 'withdraw()' function
    const withdraw = async (e) => {
        e.preventDefault();

        const formattedDeposit = ethers.utils.parseUnits(deposited).toString();

        if (protocol === 1) {

            await aggregator.withdraw(formattedDeposit, {gasLimit: 500000});

        } else if (protocol === 2) {

            await aggregator.withdraw(formattedDeposit, {gasLimit: 500000});

        }
    };


    /** helper methods */
    const amountChangeHandler = (e) => {
        setAmount(e.target.value);
    }

    const getProtocol = (protocol) => {
        if (protocol == 1) {
            return 'AAVE';
        } else if (protocol == 2) {
            return 'COMPOUND';
        } else {
            return 'NONE';
        }
    };

    return (
        <div className="container">
            <h1>Yield Aggregator</h1>
            <div className='content'>
                <div className='left'>
                    <div className='input'>
                        <label>Enter amount in WETH:</label>
                        <input 
                            type="number"
                            onChange={ amountChangeHandler }
                        />
                    </div>
                    <button onClick={ deposit }>Deposit</button>
                    <button onClick={ rebalance }>Rebalance</button>
                    <button onClick={ withdraw }>Withdraw</button>
                </div>
                <div className='right'>
                    <div><b>Current User: </b>{ userAddress }</div>
                    <div><b>Weth Balance: </b>{ wethBalance }</div>
                    <div><b>Amount Deposited: </b>{ deposited }</div>
                    <div><b>Aave APY: </b>{ initAave }</div>
                    <div><b>Compound APY: </b>{ initCompound }</div>
                    <div><b>Protocol: </b>{ getProtocol(protocol) }</div>
                </div>
            </div>
        </div>

    );

};
