#[cfg(test)]
use crate::Contract;
use near_sdk::test_utils::{accounts, VMContextBuilder};
use near_sdk::{env, testing_env, ONE_NEAR};

fn get_context(is_view: bool) -> VMContextBuilder {
    let mut builder = VMContextBuilder::new();
    builder
        .is_view(is_view)
        .current_account_id("contract.testnet".parse().unwrap());
    builder
}

// contribute
#[test]
fn test_contribute() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context
        .account_balance(ONE_NEAR)
        .predecessor_account_id(accounts(0))
        .attached_deposit(ONE_NEAR)
        .build());

    contract.contribute();
    // one near initial + one near contribution
    assert_eq!(env::account_balance(), 2 * ONE_NEAR);
}


// NFT Token ID
#[test]
fn test_mint_token() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

   

    contract.mint_NFT( String::from("Here"));
    // one near initial + one near contribution
    assert_eq!(contract.token_ids, 2);
}


// get_recent_contributions
#[test]
fn test_get_recent_contributions() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    // alice context
    testing_env!(context
        .predecessor_account_id(accounts(0))
        .attached_deposit(10)
        .build());
    contract.contribute();

    assert_eq!(
        (accounts(0), "10".to_string()),
        contract.get_recent_contributions()[0]
    );

    // bobs context
    testing_env!(context
        .predecessor_account_id(accounts(1))
        .attached_deposit(11)
        .build());
    contract.contribute();

    assert_eq!(
        (accounts(1), "11".to_string()),
        contract.get_recent_contributions()[0]
    );

    assert_eq!(
        vec![
            (accounts(1), "11".to_string()),
            (accounts(0), "10".to_string()),
        ],
        contract.get_recent_contributions()
    )
}

// add_to_blacklist
#[test]
fn test_add_to_blacklist() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context
        .predecessor_account_id("contract.testnet".parse().unwrap())
        .build());

    contract.add_to_blacklist(accounts(1));
    // bob shall be in the blacklist
    assert!(contract.blacklist.contains(&accounts(1)));
}

// batch_add_to_blacklist
#[test]
fn test_batch_add_to_blacklist() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context
        .predecessor_account_id("contract.testnet".parse().unwrap())
        .build());
    contract.batch_add_to_blacklist(vec![accounts(0), accounts(1), accounts(2)]);

    assert!(contract.blacklist.contains(&accounts(0)));
    assert!(contract.blacklist.contains(&accounts(1)));
    assert!(contract.blacklist.contains(&accounts(2)));
}

#[test]
#[should_panic]
fn test_panics_add_to_blacklist() {
    let context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context.build());
    // self is not the predecessor we shall panic!
    contract.add_to_blacklist(accounts(1));
}

// remove_from_blacklist
#[test]
fn test_remove_from_blacklist() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context
        .predecessor_account_id("contract.testnet".parse().unwrap())
        .build());

    contract.remove_from_blacklist(accounts(1));
    // bob shall not be in the the blacklist
    assert!(contract.blacklist.contains(&accounts(0)) == false);
}

#[test]
#[should_panic]
fn test_panics_remove_from_blacklist() {
    let mut context = get_context(false);
    let mut contract = Contract::default();

    testing_env!(context.predecessor_account_id(accounts(0)).build());
    // self is not the predecessor we shall panic!
    contract.remove_from_blacklist(accounts(1));
}





// #[cfg(test)]
// use near_sdk::test_utils::{ accounts, VMContextBuilder };
// use near_sdk::{ testing_env, ONE_NEAR };

// NFT minting Test
#[test]
fn test_mint_token() {
  let mut contract = Contract::default();

  contract.mint_nft(String::from("NFT metadata #1"));
  assert_eq!(contract._token_uris.get(&1), None);
}

// Creating Event Test
#[test]
fn test_create_event() {
    let mut contract = Contract::default();
  
    contract.create_event(String::from("account1.wallet"),String::from("Event metadata #1"));
  
    let get_event_uri = contract._event_uris.get(&0);
    
    let unwraped = get_event_uri.unwrap();
    
    assert_eq!(unwraped[1], "Event metadata #1");
  }
  
  