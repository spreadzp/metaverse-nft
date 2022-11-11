import React, { useState, useEffect } from "react";
import { Table, Accordion } from 'react-bootstrap';
import { decryptPrivateKey, getPublicKeyViaMetamask, metamaskEncrypt, metamaskEncryptData } from "./metamask";

import { BigNumber, ethers, utils } from 'ethers'

const BuyersBoard = props => {
    const [dataKey, setDataKey] = useState(null);
    const [totalAmountNft, setTotalAmountNft] = useState(0);
    const [nftBuyersDetails, setNftBuyersDetails] = useState([]);
    const [publicKey, setPubKey] = useState('');
    const [chosenTokenId, setChosenTokenId] = useState(0);
    const { drizzle, drizzleState, nftOwnersDetails } = props;
    const contract = drizzle.contracts.EncNft;
    const contractMarket = drizzle.contracts.MarketPlace;

    const [showBoard, setShowBoard] = useState(false);
    const [buyerIndex, setBuyerIndex] = useState(-1);
    useEffect(() => {
        getBuyers();
    }, []);


    const makeBet = async (owner) => {
        setChosenTokenId(owner.idNft)
        const pk = await getPublicKeyViaMetamask(drizzleState.accounts[0])
        if (pk) {
            setPubKey(pk)
        }
    }
    const getBuyers = async () => {
        let result = await contract.methods
            .totalSupply()
            .call({ from: drizzleState.accounts[0] });
        if (result > 0) {
            setTotalAmountNft(result)
            const tokensArray = []
            for (let index = 1; index <= result; index++) {
                tokensArray.push({ idNft: index, owner: '', name: '', description: '', image: '' })
            }
            tokensArray.map(async token => {
                try {
                    const countBuyers = await contractMarket.methods.getCountBuyers(token.idNft).call({ from: drizzleState.accounts[0] })

                    if (countBuyers > 0) {
                        for (let index = 0; index < countBuyers; index++) {
                            const buyersMakeBet = await contractMarket.methods.buyersBoard(token.idNft, index).call({ from: drizzleState.accounts[0] });
                            if (buyersMakeBet) {
                                setNftBuyersDetails(nftBuyersDetails => [...nftBuyersDetails, {
                                    idToken: token.idNft, buyerAddress: buyersMakeBet[0], buyerPubKey: buyersMakeBet[1],
                                    buyerBet: buyersMakeBet[2], goalPurchase: buyersMakeBet[3]
                                }])
                            }
                        }
                    }
                } catch (error) {
                    console.log("🚀 ~ file: BuyersBoard.js ~ line 72 ~ getBuyers ~ error", error)
                }
            })
        }
    };

    const sellNft = async (buyer, token) => {
        if (token.owner === drizzleState.accounts[0]) {
            // enc-decrypt pryvateKey - enc via buyerPubKey
            const ownerOfTokenInfo = await contract.methods.getTokenInfoLastOwner(token.idNft).call({ from: drizzleState.accounts[0] });

            const lastEncryptedPrivateKey = ownerOfTokenInfo.encData

            const decryptedPrivateKey = await decryptPrivateKey(lastEncryptedPrivateKey, drizzleState.accounts[0])

            if (decryptedPrivateKey) {
                const encData = await metamaskEncrypt(decryptedPrivateKey, buyer.buyerPubKey)
                if (encData !== '') {
                    const sellInfo = await contractMarket.methods.acceptRateAndTransferToken(token.idNft, buyer.buyerAddress, encData).send({ from: drizzleState.accounts[0], gasPrice: 10 * 10 ** 10, gasLimit: 600000 })

                }
            }


        }
    }

    const getSellerActions = (buyer, token) => {
        return (
            token.owner === drizzleState.accounts[0] && token.approved ?
                token.owner === drizzleState.accounts[0] && !token.approved ?
                    'Need to approve to sell' :
                    <button className="btn-sell" onClick={() => sellNft(buyer, token)}>Sell NFT</button > :

                ''
        )
    }
    const CountBuyers = (token) => {
        let totalSum = 0;
        const totalBuyersOfToken = nftBuyersDetails.filter(item => item.idToken === token.idNft)

        totalBuyersOfToken.map(buyer => totalSum += +utils.formatEther(buyer.buyerBet))
        return (
            <div className="info">{totalBuyersOfToken.length} buyers,  Total sum bets: {totalSum} ETH </div>

        )
    }
    const BuyersOfToken = (token) => {
        // own address make color red

        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th> Buyer address </th>
                        <th> Buyer rate </th>
                        <th> Why do I need it </th>
                        <th> Action </th>
                    </tr>
                </thead>
                <tbody>{
                    nftBuyersDetails.filter(item => item.idToken === token.idNft).map((buyer, ind) => {
                        return (buyer.buyerBet > 0 && <tr key={ind}>
                            <td className={buyer.buyerAddress === drizzleState.accounts[0] ? 'owner-address' : null}> {buyer.buyerAddress} </td>
                            <td>{utils.formatEther(buyer.buyerBet)}ETH</td>
                            <td> {buyer.goalPurchase} </td>
                            <td>{getSellerActions(buyer, token)} </td>
                        </tr>)
                    })
                }</tbody>
            </Table>)
    }



    return (
        // if it exists, then we display its value
        <>
            <button className="btn-bet" onClick={() => setShowBoard(!showBoard)}>{showBoard ? 'Hide Buyers Boards' : 'Show Buyers Boards'}</button>
            {showBoard && <Accordion defaultActiveKey="0" > {
                nftOwnersDetails.map((token, index) =>
                    <Accordion.Item eventKey={index} key={index} >
                        <Accordion.Header className="ah" onClick={() => setBuyerIndex(index)}> ID: {token.idNft} name: {token.name} {CountBuyers(token)}</Accordion.Header>
                        <Accordion.Body className={buyerIndex === index ? "active" : "inactive"} >
                            <div > {token.description} </div> {BuyersOfToken(token)}
                        </Accordion.Body> </Accordion.Item >
                )
            }

            </Accordion>}
        </>
    );
};

export default BuyersBoard;