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
    window.nearcontract = new nearAPI.Contract(wallet.account(), 'hrea-near3.testnet',{
      viewMethods: ['get_all_events','event_uri','get_token_search_from_event','get_event_raised','get_tokenid_from_uri','get_tokenuri_from_id','get_bid_info_from_nft','get_all_nfts_from_userid','get_eventid_from_tokenuri','get_all_grant_events','event_grant_uri','get_all_events_from_wallet','get_eventid_from_eventuri','check_submitted_project_grant'],
      changeMethods: ['create_event', 'mint_nft','bid_nft','set_event','set_event_raised','distribute_nft','send_nft_as_gift','reset_all','create_grant_event','create_grant_project']
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