// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AuroraERC721 is ERC721 {
	uint256 private _tokenIds;
	uint256 private _bidIds;
	uint256 private _eventIds;
	uint256 private _EventTokenIds;
	uint256 private _TokenBidIds;
	uint256 private _TokenGiftIds;
	uint256 public _EventTokenSearchIds;
	uint256 public _UserTokenIds;
	mapping(uint256 => string[2]) private AllEventTokens; //EventTokenID => EventID + TokenURI
	mapping(uint256 => string[2]) private AllTokensBids;  //TokenBidID 	 => TokenID + BidURI
	mapping(uint256 => string[2]) public AllTokensGift;  //TokenGiftIds => TokenID + GiftURI
	mapping(uint256 => string[3]) public AllUserToken;	  //UserTokenID  => User Address+ TokenID + Gifted
	mapping(uint256 => string[2]) public _SearchedStore;  //Not using
	mapping(uint256 => string) private _bidURIs;		  //BidID		 => BidURI
	mapping(uint256 => string[2]) private _tokenURIs;	  //TokenID 	 => Token URI 	 + Highest Bidder
	mapping(uint256 => string[3]) private _eventURIs;	  //EventID 	 => Event Wallet + Event URI + Finished
	mapping(uint256 => string) private _eventRaised;	  //EventID 	 => Raised
	mapping(string => string) private _eventTokens;		  //Not using
	address public owner;

constructor(string memory name, string memory symbol)
		ERC721(name, symbol)
	{}

function claimToken(
		address _claimer,
		string memory _tokenURI,
		uint256 _eventid
	) public returns (uint256) {
		_mint(_claimer, _tokenIds);
		_setTokenURI(_tokenIds, _tokenURI);
		_setTokenEvent(_EventTokenIds, _eventid, _tokenURI);
		_tokenIds++;
		_EventTokenIds++;
		return _tokenIds;
	}


function _setTokenEvent(
		uint256 EventTokenId,
		uint256 EventId,
		string memory _tokenURI
	) public virtual {
		AllEventTokens[EventTokenId] = [
			Strings.toString(EventId),
			string(_tokenURI)
		];
	}
function createEvent(string memory _eventWallet,string memory _eventURI)
		public
		returns (uint256)
	{
		_setEventURI(_eventIds,_eventWallet, _eventURI);
		_setEventRaised(_eventIds, "0");
		_eventIds++;

		return _eventIds;
	}
function createTokenGift(string memory _TokenID,string memory _Recipient,string memory _GiftURI)
		public
		returns (uint256)
	{

        for (uint256 i = 0; i < _UserTokenIds; i++) {
			if (keccak256(bytes(AllUserToken[i][1])) == keccak256(bytes(_TokenID))){
				AllUserToken[i][0] =_Recipient;
				AllUserToken[i][2] ="True";
			}
		}

		_SetGift(_TokenID, _GiftURI);

		return _TokenGiftIds;
	}

function _SetGift(string memory _TokenID,string memory _GiftURI)
		public
		returns (uint256)
	{
		for (uint256 i = 0; i < _TokenGiftIds; i++) {
			if (keccak256(bytes(AllTokensGift[i][0])) == keccak256(bytes(_TokenID))) {
				AllTokensGift[i][1] = _GiftURI;
				return i;
			}
		}
        AllTokensGift[_TokenGiftIds] =[
			_TokenID,
			_GiftURI
		];
		_TokenGiftIds++;
		return _TokenGiftIds;
	}

function geteventIdByUri(string memory _eventURI)
		public
		view
		virtual
		returns (uint256)
	{
		for (uint256 i = 0; i < _eventIds; i++) {
			if (
				keccak256(bytes(_eventURIs[i][1])) == keccak256(bytes(_eventURI))
			) {
				return i;
			}
		}

		return 0;
	}
function geteventIdFromTokenURI(string memory _tokenURI)
		public
		view
		virtual
		returns (string memory)
	{
		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (keccak256(bytes(AllEventTokens[i][1])) == keccak256(bytes(_tokenURI))) {
				return AllEventTokens[i][0];
			}
		}

		return "none";
	}



function gettokenIdByUri(string memory _tokenURI)
		public
		view
		virtual
		returns (uint256)
	{
		for (uint256 i = 0; i < _tokenIds; i++) {
			if (
				keccak256(bytes(_tokenURIs[i][0])) == keccak256(bytes(_tokenURI))
			) {
				return i;
			}
		}

		return 0;
	}

function getBidIdByUri(string memory _bidURI)
		public
		view
		virtual
		returns (uint256)
	{
		for (uint256 i = 0; i < _bidIds; i++) {
			if (keccak256(bytes(_bidURIs[i])) == keccak256(bytes(_bidURI))) {
				return i;
			}
		}

		return 0;
	}

function gettokenSearchEventTotal(uint256 EventID)
		public
		view
		virtual
		returns (string[] memory)
	{

			uint256 _TemporarySearch = 0;

		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (
				keccak256(bytes(AllEventTokens[i][0])) ==
				keccak256(bytes(Strings.toString(EventID)))
			) {
				_TemporarySearch++;
			}
		}
		string[] memory _SearchedStoreToken = new string[](_TemporarySearch);

		uint256 _EventTokenSearchIds2 = 0;

		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (
				keccak256(bytes(AllEventTokens[i][0])) ==
				keccak256(bytes(Strings.toString(EventID)))
			) {
				_SearchedStoreToken[_EventTokenSearchIds2] = AllEventTokens[i][
					1
				];
				_EventTokenSearchIds2++;
			}
		}

		return _SearchedStoreToken;
	}


function getTokensSearchEvent(uint256 EventID)
		public
		returns (string[] memory)
	{

			uint256 _TemporarySearch = 0;

		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (
				keccak256(bytes(AllEventTokens[i][0])) ==
				keccak256(bytes(Strings.toString(EventID)))
			) {
				_TemporarySearch++;
			}
		}
		string[] memory _SearchedStoreToken = new string[](_TemporarySearch);

		 _EventTokenSearchIds = 0;

		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (
				keccak256(bytes(AllEventTokens[i][0])) ==
				keccak256(bytes(Strings.toString(EventID)))
			) {
				_SearchedStoreToken[_EventTokenSearchIds] = AllEventTokens[i][
					1
				];
				_EventTokenSearchIds++;
			}
		}

		return _SearchedStoreToken;
	}

function getSearchEventbyWallet(string memory Wallet)
		public
		view
		virtual
		returns (string[] memory)
	{

		uint256 _TemporarySearch = 0;
		uint256 _SearchIds = 0;

		for (uint256 i = 0; i < _eventIds; i++) {
			if (
				keccak256(bytes(_eventURIs[i][0])) ==
				keccak256(bytes(Wallet))
			) {
				_TemporarySearch++;
			}
		}
		string[] memory _SearchedStoreEvents = new string[](_TemporarySearch);
		for (uint256 i = 0; i < _eventIds; i++) {
			if (
				keccak256(bytes(_eventURIs[i][0])) ==
				keccak256(bytes(Wallet))
			) {
				_SearchedStoreEvents[_SearchIds] = _eventURIs[i][1];
				_SearchIds++;
			}
		}


		return _SearchedStoreEvents;
	}

function getGetEventsTokenID(uint256 EventId, string memory _tokenURI)
		public
		view
		virtual
		returns (uint256)
	{
		for (uint256 i = 0; i < _EventTokenIds; i++) {
			if (
				keccak256(bytes(AllEventTokens[i][0])) ==
				keccak256(bytes(Strings.toString(EventId))) &&
				keccak256(bytes(AllEventTokens[i][1])) ==
				keccak256(bytes(_tokenURI))
			) {
				return i;
			}
		}

		return 0;
	}

function _getSearchedTokenURI(uint256 _tokenId)
		public
		view
		virtual
		returns (string memory)
	{
		return _SearchedStore[_tokenId][0];
	}

function _setEventURI(uint256 eventId,  string memory _eventWallet ,string memory _eventURI)
		public
		virtual
	{
		_eventURIs[eventId] = [
			_eventWallet,
			_eventURI,
			"False"
		];
	}

function _setTokenURI(uint256 tokenId, string memory _tokenURI)
		public
		virtual
	{

		_tokenURIs[tokenId][0] = _tokenURI;
	}

function eventURI(uint256 eventId) public view returns (string[3] memory) {
		return _eventURIs[eventId];
	}

function tokenURI(uint256 tokenId)
		public
		view
		virtual
		override
		returns (string memory)
	{


		return _tokenURIs[tokenId][0];
	}

function totalSupply() public view returns (uint256) {
		return _tokenIds;
	}

function totalEvent() external view returns (uint256) {
		return _eventIds;
	}

function _setBidURI(uint256 bidId, string memory _bidURI) public virtual {
		_bidURIs[bidId] = _bidURI;
	}

function BidURI(uint256 BidId) public view returns (string memory) {
		return _bidURIs[BidId];
	}

function getTotalBid(uint256 TokenID)
		public
		view
		virtual
		returns (string[] memory)
	{
		string[] memory _SearchedStoreBid = new string[](10);

		uint256 _TokenBidSearchIds2 = 0;

		for (uint256 i = 0; i < _TokenBidIds; i++) {
			if (
				keccak256(bytes(AllTokensBids[i][0])) ==
				keccak256(bytes(Strings.toString(TokenID)))
			) {
				_SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i][1];
				_TokenBidSearchIds2++;
			}
		}

		return _SearchedStoreBid;
	}

function getBidsSearchToken(uint256 TokenID)
		public
		view
		virtual
		returns (string[] memory)
	{
		string[] memory _SearchedStoreBid = new string[](10);

		uint256 _TokenBidSearchIds2 = 0;

		for (uint256 i = 0; i < _TokenBidIds; i++) {
			if (
				keccak256(bytes(AllTokensBids[i][0])) ==
				keccak256(bytes(Strings.toString(TokenID)))
			) {
				_SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i][1];
				_TokenBidSearchIds2++;
			}
		}

		return _SearchedStoreBid;
	}

function _setTokenBid(
		uint256 TokenBidId,
		uint256 TokenId,
		string memory _BidURI
	) public virtual {
		AllTokensBids[TokenBidId] = [
			Strings.toString(TokenId),
			string(_BidURI)
		];
	}

function getEventRaised(uint256 _eventId)
		public
		view
		virtual
		returns (string memory)
	{
		return _eventRaised[_eventId];
	}

function _setEventRaised(uint256 _eventId, string memory _raised)
		public
	{
		_eventRaised[_eventId] = _raised;
	}

 function createBid(
		uint256 _tokenId,
		string memory _bidURI,
		string memory _updatedURI,
		string memory _highestBidder,
		uint256 _eventid,
		string memory _raised
	) public   {
		uint256 _EventTokenId = getGetEventsTokenID(
			_eventid,
			_tokenURIs[_tokenId][0]
		);
		_tokenURIs[_tokenId][0] = _updatedURI;
		_tokenURIs[_tokenId][1] = _highestBidder;
		_setTokenEvent(_EventTokenId, _eventid, _updatedURI);
		_setEventRaised(_eventid,_raised);

		_setTokenBid(_TokenBidIds, _tokenId, _bidURI);
		_TokenBidIds++;
		_bidIds++;
	}
function DistributeToken(uint256 _eventId)
	public   {

	 	string[] memory _SearchedStoreToken =  getTokensSearchEvent(_eventId);
		for (uint256 i = 0; i < _EventTokenSearchIds; i++) {
			uint256 TokenIDOne = gettokenIdByUri(_SearchedStoreToken[i]);
			string memory HighestAddress = _tokenURIs[TokenIDOne][1];
			createUserToken(HighestAddress,Strings.toString(TokenIDOne));
			_eventURIs[_eventId][2] = "Finished";
		}
	}

function GetNFTsByUserAddrs(string memory _user) public view returns (string[] memory) {
		uint256 _TemporarySearch = 0;
		uint256 _SearchIds = 0;

		for (uint256 i = 0; i < _UserTokenIds; i++) {
			if (
				keccak256(bytes(AllUserToken[i][0])) ==
				keccak256(bytes(_user))
			) {
				_TemporarySearch++;
			}
		}
		string[] memory _SearchedStoreUser = new string[](_TemporarySearch);
		for (uint256 i = 0; i < _UserTokenIds; i++) {
			if (
				keccak256(bytes(AllUserToken[i][0])) ==
				keccak256(bytes(_user))
			) {
				_SearchedStoreUser[_SearchIds] = tokenURI(strToUint(AllUserToken[i][1]));
				_SearchIds++;
			}
		}
		return _SearchedStoreUser;
	}

function GetGiftedFromToken(string memory _TokenID) public view returns (string memory) {

		for (uint256 i = 0; i < _UserTokenIds; i++) {
			if (
				keccak256(bytes(AllUserToken[i][1])) ==
				keccak256(bytes(_TokenID))
			) {
				return AllUserToken[i][2];
			}
		}
		return "False";
	}

function GetGiftURIFromToken(string memory _TokenID) public view returns (string memory) {

		for (uint256 i = 0; i < _TokenGiftIds; i++) {
			if (
				keccak256(bytes(AllTokensGift[i][0])) ==
				keccak256(bytes(_TokenID))
			) {
				return AllTokensGift[i][1];
			}
		}
		return "{}";
	}

function UnWrapGift(string memory _TokenID)
		public
		returns (uint256)
	{

       for (uint256 i = 0; i < _UserTokenIds; i++) {
			if (keccak256(bytes(AllUserToken[i][1])) == keccak256(bytes(_TokenID))){
				AllUserToken[i][2] ="False";
				return i;
			}
		}

		return _UserTokenIds;
	}


function createUserToken(
		string memory _user,
		string memory _tokenid
	) private   {
		AllUserToken[_UserTokenIds] =[
			_user,
			_tokenid,
			"False"
		];
		_UserTokenIds++;
	}

function strToUint(string memory _str) public pure returns(uint256 res) {

    for (uint256 i = 0; i < bytes(_str).length; i++) {
        if ((uint8(bytes(_str)[i]) - 48) < 0 || (uint8(bytes(_str)[i]) - 48) > 9) {
            return (0);
        }
        res += (uint8(bytes(_str)[i]) - 48) * 10**(bytes(_str).length - i - 1);
    }

    return (res);
}
}


