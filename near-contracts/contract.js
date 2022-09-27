import "regenerator-runtime/runtime";
import React, { useState, useEffect } from 'react'
import * as nearAPI from "near-api-js"
import getConfig from "../config"

// Initializing contract
async function initContract() {
  try {
    console.clear();
    window.nearConfig = getConfig();
    window.near = new nearAPI.Near({
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org'
  })
 
    // Initializing Wallet based Account. It can work with NEAR TestNet wallet that
    // is hosted at https://wallet.testnet.near.org
    
    window.walletConnection = new nearAPI.WalletConnection(window.near);
  
    const wallet = window.walletConnection;
    // connect to a NEAR smart contract
    window.nearcontract = new nearAPI.Contract(wallet.account(), 'hrea-near2.testnet',{
      viewMethods: ['get_all_events','event_uri'],
      changeMethods: ['create_event', 'mint_nft']
    })
    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletConnection.getAccountId();
  } catch (error) {
    console.error(error)
  }
 
}

if (typeof window !== "undefined") {
  window.nearInitPromise = initContract()

  
}
// export default null;