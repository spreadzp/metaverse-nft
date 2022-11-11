import React, { useState, useEffect, Fragment } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"; 
import UploadIPFS from "./UploadIPFS";
import DownloadIPFS from "./DownloadIPFS";
import MarketPlace from "./MarketPlace";
import OwnerAssets from "./OwnerAssets";
import Contacts from "./Contacts";

const App = props => {
  const [drizzleReadinessState, setDrizzleReadinessState] = useState({
    drizzleState: null,
    loading: true
  });
  const { drizzle } = props;

  useEffect(
    () => {
      const unsubscribe = drizzle.store.subscribe(() => {
        // every time the store updates, grab the state from drizzle
        const drizzleState = drizzle.store.getState();
        // check to see if it's ready, if so, update local component state
        if (drizzleState.drizzleStatus.initialized) {
          setDrizzleReadinessState({
            drizzleState: drizzleState,
            loading: false
          });
        }
      });
      return () => {
        unsubscribe();
      };
    },
    [drizzle.store, drizzleReadinessState]
  ); 
  return drizzleReadinessState.loading ? (
    <div align="center">
      <h4>
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Please install Metamask extension and reload the page
        </a>
      </h4>
      Set it on the rinkeby test network
    </div>
  ) : (
    <Router>
      <div>
        <div className="title_logo">
          <img
            src={
              "assets/enc-nft-logo.png"
            }
          />
          <h1>Encoded NFT</h1>
        </div> 
        <br /> 
        <br />
        <br />

        <nav className="menu">
          <ul> 
            <li>
              <Link className="link" to="/">Market Place</Link>
            </li>
            <li>
              <Link className="link" to="/assets">Owner Assets</Link>
            </li> 
            <li>
              <Link className="link" to="/upload-ipfs">Upload a file to IPFS</Link>
            </li> 
            <li>
              <Link className="link" to="/contacts">Contacts</Link>
            </li> 
          </ul>
        </nav>

        <hr />
        <br />
        <Switch>
          <Route exact path="/">
            <MarketPlace
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/assets">
            <OwnerAssets
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
            </Route>           
          <Route path="/upload-ipfs">
            <UploadIPFS
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/download-ipfs">
            <DownloadIPFS
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
          <Route path="/contacts">
            <Contacts
              drizzle={drizzle}
              drizzleState={drizzleReadinessState.drizzleState}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
