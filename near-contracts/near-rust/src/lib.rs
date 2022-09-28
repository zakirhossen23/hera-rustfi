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
  _token_uris: HashMap<i32, Vec<String>>,           //_TOKEN_IDS 	     => Token URI 	 + Highest Bidder
  _event_raised: HashMap<i32, String>,              //_EVENT_IDS 	     => Raised
  _event_uris: HashMap<i32, Vec<String>>,           //_EVENT_IDS       => Event Wallet + Event URI + Finished
  all_event_tokens: HashMap<i32, Vec<String>>,      //_EVENT_TOKEN_ID  => Event ID + Token URI
  all_tokens_bids: HashMap<i32, Vec<String>>,       //_TOKEN_BID_ID    => TokenID + BidURI

  recent_contributions: Vec<(AccountId, Balance)>,
  recent_receivers: HashMap<AccountId, u64>,
  ft_faucet: HashMap<AccountId, FTconfig>,
  blacklist: LookupSet<AccountId>,
}

impl Default for Contract {
  fn default() -> Self {
    Self {
      //Variables
      _token_uris: HashMap::new(),
      _event_raised: HashMap::new(),
      _event_uris: HashMap::new(), 
      all_event_tokens:HashMap::new(), 
      all_tokens_bids:HashMap::new(),

      recent_contributions: Vec::new(),
      recent_receivers: HashMap::new(),
      ft_faucet: HashMap::new(),
      blacklist: LookupSet::new(b"s"),
    }
  }
}

static mut _TOKEN_IDS: i32 = 0;
static mut _EVENT_IDS: i32 = 0;
static mut _EVENT_TOKEN_ID: i32 = 0;
static mut _TOKEN_BID_ID: i32 = 0;


#[near_bindgen]
impl Contract {
  //NFTs
  pub fn mint_nft(&mut self, nft_metadata: String,event_id:&i32) -> i32 { //Mint NFT
    //Inserting NFT metadata in Token URIs
    let mut stuff_nft : Vec<String> = Vec::new();
    stuff_nft.push(nft_metadata.to_string());
    stuff_nft.push(String::from(""));
    self._token_uris.insert(unsafe { _TOKEN_IDS }, stuff_nft);

    //Inserting Event ID + NFT Metadata into All Event Token variable
    let mut stuff : Vec<String> = Vec::new();
    stuff.push(event_id.to_string());
    stuff.push(nft_metadata.to_string());
    self.all_event_tokens.insert(unsafe { _EVENT_TOKEN_ID },stuff);

    //Incrementing Variables
    unsafe {
      _TOKEN_IDS += 1;
      _EVENT_TOKEN_ID += 1;
    }
    return unsafe { _TOKEN_IDS };
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

  #[payable]
  pub fn bid_nft(&mut self,_token_id:&i32 ,_bid_uri:String ,_updated_uri:String ,_highest_bidder:String , _eventid:&i32 , _raised:String ) {

    let event_token_id:i32 = self.get_all_events_tokens_id(_eventid,(*self._token_uris.get(_token_id).unwrap()[0]).to_string());
    self._token_uris.get_mut(_token_id).unwrap()[0] = (*_updated_uri).to_string();
    self._token_uris.get_mut(_token_id).unwrap()[1] = (*_highest_bidder).to_string();
    self.all_event_tokens.get_mut(&event_token_id).unwrap()[0] = (*_eventid).to_string();
    self.all_event_tokens.get_mut(&event_token_id).unwrap()[0] = (*_updated_uri).to_string();
    *self._event_raised.get_mut(_token_id).unwrap() = (*_raised).to_string();
    *self._event_raised.get_mut(_token_id).unwrap() = (*_raised).to_string();
    
    let mut stuff : Vec<String> = Vec::new();
    stuff.push(_token_id.to_string());
    stuff.push(_bid_uri.to_string());

    unsafe {
    self.all_tokens_bids.insert(_TOKEN_BID_ID,stuff);
    _TOKEN_BID_ID += 1;}
  }



  //Events
  pub fn create_event(&mut self, _event_wallet: String, _event_uri: String) -> i32 {
    let mut stuff : Vec<String> = Vec::new();
    stuff.push(_event_wallet.to_string());
    stuff.push(_event_uri.to_string());
    stuff.push("False".to_string());

    self._event_uris.insert(unsafe { _EVENT_IDS },stuff);
    self._event_raised.insert(unsafe { _EVENT_IDS },String::from("0"));
    unsafe {_EVENT_IDS += 1;}
    return unsafe { _EVENT_IDS };
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



// Creating Event Test
#[test]
fn test_create_event() {
    let mut contract = Contract::default();
  
    contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
  
    // println!("All Events List         => {}",contract.get_all_events());
    // println!("Event raised of Event 0 => {}",contract.get_event_raised(&0));
    
    // let get_event_uri = contract._event_uris.get(&0);    
    // let unwraped = get_event_uri.unwrap();    
    // assert_eq!(unwraped[1], "Event metadata #1");
  }
  
  // NFT minting Test
#[test]
fn test_mint_token() {
  let mut contract = Contract::default();

  contract.mint_nft(String::from("NFT metadata #1"), &0);
  contract.mint_nft(String::from("NFT metadata #2"), &1);
  contract.mint_nft(String::from("NFT metadata #23"), &1);

  // println!("Token id                   => {:#?}", contract.get_tokenid_from_uri(String::from("NFT metadata #2")));
  // println!("Token Uri                  => {:#?}", contract.get_tokenuri_from_id(&0));
  // println!("\nAll Tokens inside Event 1  => {:#?}", contract.get_token_search_from_event(&1));


  // assert_eq!(contract._token_uris.get(&1), None);
}
  
#[test]
fn test_bid_nft() {
  let mut contract = Contract::default();
  contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
  contract.mint_nft(String::from("NFT metadata #1"), &0);
  contract.bid_nft(&0,String::from("NFT metadata #1"),String::from("NFT made bid metadata #1"),String::from("highestbidder.testnet"),&0,String::from("200"));

  // println!("\nAll Tokens inside Event 0  => {:#?}", contract._token_uris.get(&0));


  // assert_eq!(contract._token_uris.get(&1), None);
}
