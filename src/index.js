import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Web3 from "web3";

// import drizzle functions and contract artifact
import { Drizzle } from "drizzle";
import MarketPlace from "./contracts/MarketPlace.json";
import EncNft from "./contracts/EncNft.json"
const web3 = new Web3(window.web3.currentProvider);

// let drizzle know what contracts we want and how to access our test blockchain
const options = {
  contracts: [
    {
      contractName: 'EncNft',
      web3Contract: new web3.eth.Contract(EncNft.abi, '0xd7d366cF18D57c6aFC62Fd16FDbBBab08066988F') 
    },
    {
      contractName: 'MarketPlace',
      web3Contract: new web3.eth.Contract(MarketPlace.abi, '0x7680956dFC896f00bedD1Dc1285e1B1c56c327EE') 
    }    
  ],
  web3: {
    block: false,
    // customProvider: new Web3("ws://localhost:8545"),
    customProvider: new Web3(window.web3.currentProvider),
  },
  // syncAlways:true,
  polls: {
    accounts: 2000,
  },
};

// setup drizzle
const drizzle = new Drizzle(options);

ReactDOM.render(<App drizzle={drizzle}/>, document.getElementById('root'));
