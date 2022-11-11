import React, { useState, useEffect } from "react";
import { Table } from 'react-bootstrap';
import BuyersBoard from "./BuyersBoard";
import BetForm from "./BetForm";
import { getPublicKeyViaMetamask } from "./metamask";

const MarketPlace = props => {
  const [totalAmountNft, setTotalAmountNft] = useState(0);
  const [nftOwnersDetails, setNftOwnersDetails] = useState([]);
  const { drizzle, drizzleState } = props;
  const contract = drizzle.contracts.EncNft;
  const contractMarket = drizzle.contracts.MarketPlace;

  const [publicKey, setPubKey] = useState('');
  const [chosenTokenId, setChosenTokenId] = useState(0);
  const [showBetForm, setShowBetForm] = useState(false);
  const [showSellers, setShowSellers] = useState(false);
  useEffect(() => {
    if (drizzleState.accounts[0]) {
      fillOwnersTokens();
    }

  }, [drizzleState.accounts[0]]);

  const makeBet = async (owner) => {
    setChosenTokenId(owner.idNft)
    const pk = await getPublicKeyViaMetamask(drizzleState.accounts[0])
    if (pk) {
      setPubKey(pk)
      setShowBetForm(true)
    }
  }

  const transferNFT = async (owner) => {
    // need to add seller description in UI
    let result = await contractMarket.methods.moveTokenForSell(owner.idNft, `Advertise of token ${owner.idNft}`).send({
      from: drizzleState.accounts[0],
      gasLimit: 150000
    }) 
  }

  const approveNFT = async (owner) => {
    let result = await contract.methods.approve(contractMarket.address, owner.idNft).send({
      from: drizzleState.accounts[0],
      gasLimit: 150000
    })
    console.log("🚀 ~ file: MarketPlace.js ~ line 51 ~ result ~ result", result)
  }

  const fillOwnersTokens = async () => {
    let result = await contract.methods
      .totalSupply()
      .call({ from: drizzleState.accounts[0] });
    if (result > 0) {
      setTotalAmountNft(result)
      const ownersArray = []
      for (let index = 1; index <= result; index++) {
        ownersArray.push({ idNft: index, owner: '', approved: false, isTokenForSell: false, name: '', description: '', image: '' })
      }
      ownersArray.map(async owner => {
        const ownerAddress = await contract.methods.ownerOf(owner.idNft).call({ from: drizzleState.accounts[0] });
        if (ownerAddress) {
          owner.owner = ownerAddress
          const approvedAddress = await contract.methods.getApproved(owner.idNft).call({ from: drizzleState.accounts[0] });
          const tokenInfo = await contract.methods.tokenURI(owner.idNft).call({ from: drizzleState.accounts[0] });

          if (approvedAddress) {
            owner.approved = approvedAddress === contractMarket.address
          }
          if (tokenInfo) {
            const tokenInfoJson = JSON.parse(tokenInfo)
            owner = { ...owner, ...tokenInfoJson };
          }
          setNftOwnersDetails(nftOwnersDetails => [...nftOwnersDetails, owner])
        }
      })
    }

  };

  const getTxStatus = () => {
    const { transactions, transactionStack } = drizzleState;
    // const txHash = transactionStack[stackId];
    // if (!txHash) return null; 
    // return `Transaction status: ${transactions[txHash] &&
    //   transactions[txHash].status}`;
  };

  return (
    // if it exists, then we display its value
    <section>
      <h2>MarketPlace</h2>
      <button className="btn-sell" onClick={() => setShowSellers(!showSellers)}>{showSellers ? 'Hide NFT Board' : 'Show NFT Board'}</button>
      {showSellers && <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID NFT</th>
            <th>Name</th>
            <th>Description</th>
            <th>URI</th>
            <th>Owner address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {nftOwnersDetails.length == totalAmountNft ? nftOwnersDetails.map((owner, ind) =>
            <tr key={ind}>
              <td>{owner.idNft}</td>
              <td>{owner.name}</td>
              <td>{owner.description}</td>
              <td><a href={owner.image} target="_blank">URL</a></td>
              <td className={drizzleState.accounts[0] === owner.owner ? 'owner-address' : null}> {owner.owner}</td>
              <td>{drizzleState.accounts[0] === owner.owner ?
                owner.approved ?
                  <button className="btn-for-sell" onClick={() => transferNFT(owner)}>Open NFT for sell </button> :
                  <button className="btn-approve" onClick={() => approveNFT(owner)}>Approve NFT for sell</button> :
                <button className="btn-bet" onClick={() => makeBet(owner)}> Make BET</button>}</td>
            </tr>
          ) : <></>}
        </tbody>
      </Table>}

      {<section>
        {showBetForm && <BetForm
          drizzle={drizzle}
          drizzleState={drizzleState}
          idToken={chosenTokenId}
          pk={publicKey}
          address={drizzleState.accounts[0]}
          showForm={() => setShowBetForm}
          isShowForm={showBetForm}
        />}
      </section>}
      <BuyersBoard
        drizzle={drizzle}
        drizzleState={drizzleState}
        nftOwnersDetails={nftOwnersDetails}
      />
    </section>
  );
};

export default MarketPlace;
