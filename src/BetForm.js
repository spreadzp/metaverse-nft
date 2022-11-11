import React, { useState, useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { BigNumber, ethers, utils } from 'ethers' 

const BetForm = props => {
    const [stackId, setStackID] = useState(null);
    const [clearData, setClearData] = useState('');
    const [hashMint, setHashMint] = useState('');
    const [pubKey, setPubKey] = useState('');
    const { drizzle, drizzleState, pk, address, idToken, showForm, isShowForm  } = props;
    const contract = drizzle.contracts.MarketPlace;


    const {register, handleSubmit, watch, errors, setFocus } = useForm();
    const onSubmit = async (data) => {
        // const stringUri = setUri(data);
        const bnValue  = BigNumber.from(utils.parseUnits(data.valueBet, 18))
        // console.log("🚀 ~ file: MintNFT.js ~ line 19 ~ onSubmit ~ stringUri", stringUri)
        const resMint = await contract.methods.makeBet(idToken, pk, drizzleState.accounts[0], data.goalPurchase).send({ from: drizzleState.accounts[0], 
            value: bnValue, gasPrice: 10 * 10 ** 10,
            gasLimit: 400000})
            showForm(false)
        if (resMint) {
            setHashMint(resMint.transactionHash)
        }
    };

  
    const getTxStatus = () => {
        // get the transaction states from the drizzle state
        const { transactions, transactionStack } = drizzleState;

        // get the transaction hash using our saved `stackId`
        const txHash = transactionStack[stackId];

        // if transaction hash does not exist, don't display anything
        if (!txHash) return null;

        // otherwise, return the transaction status
        return `Transaction status: ${transactions[txHash] &&
            transactions[txHash].status}`;
    };

    return (
    <>
 {isShowForm && <section>
            <div>Bet params</div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="u-full-width">
                        <label htmlFor="mNft">Id token</label>
                        <input
                            name="tokenId"
                            className="u-full-width"
                            value={idToken}
                            disabled={true}
                            ref={register({ required: true, maxLength: 82 })}
                        />
                        {errors.tokenId && <span>Use a valid input</span>}
                    </div>
                </div>
                <div className="row">
                    <div className="u-full-width">
                        <label htmlFor="pk">Public key of your account</label>
                        <input
                            name="pk"
                            className="u-full-width"
                            value={pk}
                            disabled={true}
                            ref={register({ required: true, maxLength: 82 })}
                        />
                        {errors.pk && <span>Use a valid input</span>}
                    </div>
                </div>
                <div className="row">
                    <div className="u-full-width">
                        <label htmlFor="address">Your account address</label>
                        <input
                            name="address"
                            className="u-full-width"
                            value={address}
                            disabled={true}
                            ref={register({ required: true, maxLength: 82 })}
                        />
                        {errors.address && <span>Use a valid input</span>}
                    </div>
                </div>
                <div className="row">
                    <div className="u-full-width">
                        <label htmlFor="valueBet">Your bet in ETH</label>
                        <input
                            name="valueBet"                            
                            className="u-full-width"
                            type="number"
                            step="0.000000000000001" 
                            ref={register({ required: true, maxLength: 82 })}
                        />
                        {errors.valueBet && <span>Use a valid input</span>}
                    </div>
                </div>
                <div className="row">
                    <div className="u-full-width">
                        <label htmlFor="goalPurchase">Why do I need it? </label>
                        <input
                            name="goalPurchase"
                            className="u-full-width"
                            ref={register({ required: true, maxLength: 82 })}
                        />
                        {errors.goalPurchase && <span>Use a valid input</span>}
                    </div>
                </div>

                <input className="button-primary" type="submit" value="Make Bet" />
            </form>
            <div>
                Hash mint transaction:  {hashMint}
            </div>             
        </section>}
    </>
      
    );
};

export default BetForm;
