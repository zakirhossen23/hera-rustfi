use near_sdk::{
  assert_self,
  borsh::{ self, BorshDeserialize, BorshSerialize },
  collections::LookupSet,
  env,
  json_types::U128,
  near_bindgen,
  require,
  AccountId,
  Balance,
  Promise,
  serde_json
};

mod external;
mod fungible_tokens;
mod settings;

use crate::fungible_tokens::*;
use crate::settings::*;
use external::vault_contract;
use std::collections::HashMap;


#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
  //Variables
  _event_ids: i32,
  _token_ids: i32,
  _event_token_id: i32,
  _token_bid_id: i32,
  _user_token_id:i32,
  _token_uris: HashMap<i32, Vec<String>>,           //_token_ids 	     => Token URI 	 + Highest Bidder
  _event_raised: HashMap<i32, String>,              //_event_ids 	     => Raised
  _event_uris: HashMap<i32, Vec<String>>,           //_event_ids       => Event Wallet + Event URI + Finished
  all_event_tokens: HashMap<i32, Vec<String>>,      //_event_token_id  => Event ID + Token URI
  all_tokens_bids: HashMap<i32, Vec<String>>,       //_token_bid_id    => TokenID + BidURI
  all_user_tokens: HashMap<i32, Vec<String>>,       //_user_token_id   => User Address+ TokenID + Gifted

  recent_contributions: Vec<(AccountId, Balance)>,
  recent_receivers: HashMap<AccountId, u64>,
  ft_faucet: HashMap<AccountId, FTconfig>,
  blacklist: LookupSet<AccountId>,
}

impl Default for Contract {
  fn default() -> Self {
    Self {
      _event_ids : 0,
      _token_ids: 0,
      _event_token_id: 0,
      _token_bid_id:0,
      _user_token_id:0,
      //Variables
      _token_uris: HashMap::new(),
      _event_raised: HashMap::new(),
      _event_uris: HashMap::new(), 
      all_event_tokens:HashMap::new(), 
      all_tokens_bids:HashMap::new(),
      all_user_tokens:HashMap::new(),

      recent_contributions: Vec::new(),
      recent_receivers: HashMap::new(),
      ft_faucet: HashMap::new(),
      blacklist: LookupSet::new(b"s"),
    }
  }
}



#[near_bindgen]
impl Contract {
  //NFTs
  pub fn mint_nft(&mut self, nft_metadata: String,event_id:&i32) -> i32 { //Mint NFT
    //Inserting NFT metadata in Token URIs
    let mut stuff_nft : Vec<String> = Vec::new();
    stuff_nft.push(nft_metadata.to_string());
    stuff_nft.push(String::from(""));
    self._token_uris.insert(self._token_ids, stuff_nft);

    //Inserting Event ID + NFT Metadata into All Event Token variable
    let mut stuff : Vec<String> = Vec::new();
    stuff.push(event_id.to_string());
    stuff.push(nft_metadata.to_string());
    self.all_event_tokens.insert(self._event_token_id,stuff);

    //Incrementing Variables
    self._token_ids += 1;
    self._event_token_id +=1;
    return self._token_ids ;
  }

  pub fn get_tokenid_from_uri(&self,token_uri:String)-> i32{
    let mut found_token_id: i32 = -1;
    for  (k, v) in self._token_uris.iter() {
      if v[0].to_string() == token_uri.to_string(){
        found_token_id = *k;
      }
    }    
    return found_token_id;
  }

  pub fn get_tokenuri_from_id(&self,token_id:&i32)-> String{      
    return (self._token_uris.get(token_id).unwrap()[0]).to_string();
  }

  //NFTs => Bid
  #[payable]
  pub fn bid_nft(&mut self,_token_id:&i32 ,_bid_uri:String ,_updated_uri:String ,_highest_bidder:String , _eventid:&i32 , _raised:String ) {

    let event_token_id:i32 = self.get_all_events_tokens_id(_eventid,(*self._token_uris.get(_token_id).unwrap()[0]).to_string());
    self._token_uris.get_mut(_token_id).unwrap()[0] = (*_updated_uri).to_string();
    self._token_uris.get_mut(_token_id).unwrap()[1] = (*_highest_bidder).to_string();
    self.all_event_tokens.get_mut(&event_token_id).unwrap()[0] = (*_eventid).to_string();
    self.all_event_tokens.get_mut(&event_token_id).unwrap()[1] = (*_updated_uri).to_string();

    *self._event_raised.get_mut(_eventid).unwrap() = (*_raised).to_string();

    let mut stuff : Vec<String> = Vec::new();
    stuff.push(_token_id.to_string());
    stuff.push(_bid_uri.to_string());

    
    self.all_tokens_bids.insert(self._token_bid_id,stuff);
    self._token_bid_id += 1;
  }

  pub fn get_bid_info_from_nft(&self,token_id:&i32)-> String{
    //Filtering all bid info by token id
    let new: HashMap<&i32, &Vec<String>> =  self.all_tokens_bids.iter()
    .filter(|(_id, value)| value[0].to_string() == token_id.to_string()).collect();

    //Getting only the bid URIs from the filtered
    let bid_uris_list:Vec<&String> = new.iter().map(|(_id,value)| {return &value[1]} ).collect();

    return serde_json::to_string(&bid_uris_list).unwrap();
  } 



  //Events
  pub fn create_event(&mut self, _event_wallet: String, _event_uri: String) -> i32 {
    let mut stuff : Vec<String> = Vec::new();
    stuff.push(_event_wallet.to_string());
    stuff.push(_event_uri.to_string());
    stuff.push("False".to_string());

    self._event_uris.insert(self._event_uris.len() as i32,stuff);
    self._event_raised.insert(self._event_raised.len() as i32,String::from("0"));
    self._event_ids += 1;
    return self._event_ids ;
  }

  pub fn set_event(&mut self, _event_id: &i32, _event_wallet: String,_event_uri: String) {
    self._event_uris.get_mut(_event_id).unwrap()[0] = (*_event_wallet).to_string();
    self._event_uris.get_mut(_event_id).unwrap()[1] = (*_event_uri).to_string(); 
  }
  #[payable]
  pub fn set_event_raised(&mut self, _event_id: &i32,raised: String) {
    *self._event_raised.get_mut(_event_id).unwrap() = (*raised).to_string();
  }


  pub fn get_all_events(&self)-> String{
    let json = serde_json::to_string(&self._event_uris).unwrap();
    return json;
  }

  pub fn event_uri(&self,event_id:&i32)-> String{
    let json = serde_json::to_string(&self._event_uris.get(event_id)).unwrap();
    return json;
  }

  pub fn get_event_raised(&self,event_id:&i32)-> String{
    return self._event_raised.get(event_id).unwrap().to_string();
  }
  
  pub fn get_eventid_from_tokenuri(&self,token_uri:String)-> i32{
    let mut found_id: i32 = -1;
    for  (k, v) in self._event_uris.iter() {
      if  v[1].to_string() == token_uri.to_string() {
        found_id = *k;
      }
    }    
    return found_id;
  }


  //Events and Tokens
  pub fn get_token_search_from_event(&self,event_id:&i32)-> String{
    //Filtering all the event id contains Tokens
    let new: HashMap<&i32, &Vec<String>> =  self.all_event_tokens.iter()
    .filter(|(_id, value)| value[0].to_string() == event_id.to_string()).collect();

    //Getting only the token URIs from the filtered
    let token_uris_list:Vec<&String> = new.iter().map(|(_id,value)| {return &value[1]} ).collect();

    return serde_json::to_string(&token_uris_list).unwrap();
  }

  pub fn get_all_events_tokens_id(&self,event_id:&i32, token_uri:String)-> i32{
    let mut found_id: i32 = -1;
    for  (k, v) in self.all_event_tokens.iter() {
      if  v[0].to_string() == event_id.to_string() && v[1].to_string() == token_uri.to_string()  {
        found_id = *k;
      }
    }    
    return found_id;
  }

  pub fn distribute_nft(&mut self, event_id:&i32) { //Distribut NFT
    //Getting all the Nfts of this event
      let new: HashMap<&i32, &Vec<String>> =  self.all_event_tokens.iter()
      .filter(|(_id, value)| value[0].to_string() == event_id.to_string()).collect();
      let token_uris_list:Vec<&String> = new.iter().map(|(_id,value)| {return &value[1]} ).collect();
      for value in token_uris_list {
        let token_id_one:i32 = self.get_tokenid_from_uri(value.to_string());
        let highest_bidder:String = self._token_uris.get(&token_id_one).unwrap()[1].to_string();
       //Inserting User Address+ TokenID + Gifted into All User Token variable
       let mut stuff : Vec<String> = Vec::new();
       stuff.push(highest_bidder.to_string());
       stuff.push(token_id_one.to_string());
       stuff.push(String::from("False"));
       self.all_user_tokens.insert(self._user_token_id ,stuff);
       self._user_token_id += 1; 
      }

      self._event_uris.get_mut(event_id).unwrap()[2] = String::from("Finished");
   
  }

  
  pub fn get_all_nfts_from_userid(&self,user:String)-> String{
    let mut stuff : Vec<String> = Vec::new(); 
    for  (_k, v) in self.all_user_tokens.iter() {
      if  v[0].to_string() == user.to_string() {
        stuff.push(v[1].to_string());
      }
    }    
    let json = serde_json::to_string(&stuff).unwrap();
    return json;
  }

  pub fn send_nft_as_gift(&mut self, token_id:&i32,user:String) { //Send NFT as GIft
    let mut found_id: i32 = -1;
    for  (k, v) in self.all_user_tokens.iter() {
      if  v[1].to_string() == token_id.to_string() {
        found_id = *k;
      }
    }    
    self.all_user_tokens.get_mut(&found_id).unwrap()[0] = (user).to_string();
  }


  

  pub fn request_funds(&mut self, receiver_id: AccountId, amount: U128) {
    // check if predecessor is in the blacklist
    require!(
      self.blacklist.contains(&env::predecessor_account_id()) == false,
      "Account has been blacklisted!"
    );
    require!(amount.0 <= MAX_WITHDRAW_AMOUNT, "Withdraw request too large!");

    let current_timestamp_ms: u64 = env::block_timestamp_ms();

    // purge expired restrictions
    self.recent_receivers.retain(|_, v: &mut u64| *v + REQUEST_GAP_LIMITER > current_timestamp_ms);

    // did the receiver get money recently? if not insert them in the the map
    match self.recent_receivers.get(&receiver_id) {
      Some(previous_timestamp_ms) => {
        // if they did receive within the last ~30 min block them
        if &current_timestamp_ms - previous_timestamp_ms < REQUEST_GAP_LIMITER {
          env::panic_str("You have to wait for a little longer before requesting to this account!");
        }
      }
      None => {
        self.recent_receivers.insert(receiver_id.clone(), current_timestamp_ms);
      }
    }
    // make the transfer
    Promise::new(receiver_id.clone()).transfer(amount.0);
    // check if additional liquidity is needed
    if env::account_balance() < MIN_BALANCE_THRESHOLD {
      self.request_additional_liquidity();
    }
  }

  // #[private] this macro does not expand for unit testing therefore I'm ignoring it for the time being
  pub fn add_to_blacklist(&mut self, account_id: AccountId) {
    assert_self();
    self.blacklist.insert(&account_id);
  }

  pub fn batch_add_to_blacklist(&mut self, accounts: Vec<AccountId>) {
    assert_self();
    // sadly no append TODO: Optimise
    for account in accounts {
      self.blacklist.insert(&account);
    }
  }

  // #[private] this macro does not expand for unit testing therefore I'm ignoring it for the time being
  pub fn remove_from_blacklist(&mut self, account_id: AccountId) {
    assert_self();
    self.blacklist.remove(&account_id);
  }
 
  // #[private] this macro does not expand for unit testing therefore I'm ignoring it for the time being
  pub fn clear_recent_receivers(&mut self) {
    assert_self();
    self.recent_receivers.clear();
  }

  // contribute to the faucet contract to get in the list of fame
  #[payable]
  pub fn contribute(&mut self) {
    let contributor: AccountId = env::predecessor_account_id();
    let amount: Balance = env::attached_deposit();

    self.recent_contributions.insert(0, (contributor, amount));
    self.recent_contributions.truncate(10);
  }

  // get top contributors
  pub fn get_recent_contributions(&self) -> Vec<(AccountId, String)> {
    self.recent_contributions
      .iter()
      .map(|(account_id, amount)| (account_id.clone(), amount.to_string()))
      .collect()
  }

  // request_additional_liquidity
  fn request_additional_liquidity(&self) {
    vault_contract::ext(VAULT_ID.parse().unwrap()).request_funds();
  }
}



#[cfg(test)]

// // All Tests
// #[test]
// fn test_create_event() {
//     let mut contract = Contract::default();
  
//     contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
//     contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
  
//     // println!("All Events List         => {}",contract.get_all_events());
//     // println!("Event Event 0 => {:#?}",contract._event_uris.get(&0));
    
//     // contract.set_event(&0,String::from("account1.wallet"),String::from("metadata -v1"));
//     // contract.set_event_raised(&0,String::from("20"));
//     // println!("Event raised of Event 0 => {}",contract.get_event_raised(&0));
//     println!("Event Event 0 => {:#?}",contract.get_all_events());
//     // let get_event_uri = contract._event_uris.get(&0);    
//     // let unwraped = get_event_uri.unwrap();    
//     // assert_eq!(unwraped[1], "Event metadata #1");
//   }
  
//   // NFT minting Test
// #[test]
// fn test_mint_token() {
//   let mut contract = Contract::default();

//   contract.mint_nft(String::from("NFT metadata #1"), &0);
//   contract.mint_nft(String::from("NFT metadata #2"), &1);
//   contract.mint_nft(String::from("NFT metadata #23"), &1);

//   // println!("Token id                   => {:#?}", contract.get_tokenid_from_uri(String::from("NFT metadata #2")));
//   // println!("Token Uri                  => {:#?}", contract.get_tokenuri_from_id(&0));
//   // println!("\nAll Tokens inside Event 1  => {:#?}", contract.get_token_search_from_event(&1));


//   // assert_eq!(contract._token_uris.get(&1), None);
// }
  
// #[test]
// fn test_bid_nft() {
//   let mut contract = Contract::default();
//   contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
//   contract.mint_nft(String::from("NFT metadata #1"), &0);
//   // println!("\nAll Tokens inside Event 1  => {:#?}", contract._event_raised);

//   contract.bid_nft(&0,String::from("{BId metadata #1}"),String::from("NFT made bid metadata #1 of 200"),String::from("highestbidder.testnet"),&0,String::from("200"));

//   // println!("\nAll Tokens inside Event 1  => {:#?}", contract._token_uris.get(&0));
//   // println!("\nAll Tokens inside Event 1  => {:#?}", contract.get_token_search_from_event(&0));

//   // println!("\nAll bid info of Token 1  => {:#?}",contract.get_bid_info_from_nft(&0));


//   // assert_eq!(contract._token_uris.get(&1), None);
// }

#[test]
fn test_distribute_nft() {
  let mut contract = Contract::default();
  
  contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));  
  contract.mint_nft(String::from("NFT metadata #1"), &0);
  contract.mint_nft(String::from("NFT metadata #2"), &0);
  contract.mint_nft(String::from("NFT metadata #23"), &1);
  contract.bid_nft(&0,String::from("{BId metadata #1}"),String::from("NFT made bid metadata #1 of 200"),String::from("highestbidder.testnet"),&0,String::from("200"));
  contract.bid_nft(&1,String::from("{BId metadata #2}"),String::from("NFT made bid metadata #2 of 200"),String::from("highestbidder1.testnet"),&0,String::from("300"));


  contract.distribute_nft(&0);
  // println!("\nAll User Tokens  => {:#?}",contract.all_user_tokens);
  // println!("\n Get one User Collectibles => {:#?}",contract.get_all_nfts_from_userid(String::from("highestbidder.testnet")));
  // println!("\nEvent status  => {:#?}",contract._event_uris);


  // assert_eq!(contract._token_uris.get(&1), None);
}