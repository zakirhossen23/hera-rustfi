
import usContract from '../../../services/api/useContractApi';
import send_token from '../../../services/api/sendToken';
import WaitUntilTransactions from '../../../services/api/WaitForTransactions';

export default async function handler(req, res) {
  //Variables
  let id = Number(req.query.id)
  let privatekey = req.body.privatekey
  let biddingPrice = req.body.BidPrice

  const contract = usContract(privatekey);
  let output = null;
  async function fetchContractData() {
    if (window.nearcontract) {
      // try {
      const tokenURIJSON = await contract.tokenURI(id);
      let tokenURI = JSON.parse(tokenURIJSON);
      //Transfer
      if (biddingPrice < Number(tokenURI.properties.price.description)) {
        output = JSON.stringify({
          status: "error",
          message: `The bid price is lower than ${tokenURI.properties.price.description}!`
        })
        return;
      }

      let senderAddress = "";
      try {
        senderAddress = await send_token(biddingPrice.toString(), tokenURI.properties.wallet.description, privatekey)
      } catch (error) {
        output = JSON.stringify({
          status: "error",
          from: "Transferring Error",
          message: error
        })
        return;
      }


      //Contract
      var parsed = tokenURI;
      let eventId = Number(tokenURI.properties.eventID);
      parsed['properties']['price']['description'] = biddingPrice.toString();
      let currentDate = new Date();
      const createdObject = {
        title: 'Asset Metadata Bids',
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: senderAddress
          },
          bid: {
            type: 'string',
            description: biddingPrice
          },
          time: {
            type: 'string',
            description: currentDate
          }
        }
      };
      const totalraised = await contract.getEventRaised(eventId);
      let Raised = 0;
      Raised = Number(totalraised) + Number(biddingPrice);
      const result2 = await contract.createBid(id, JSON.stringify(createdObject), JSON.stringify(parsed),senderAddress, eventId, Raised.toString());

      output = JSON.stringify({
        status: "success",
        message: `Bid successful`
      })
      console.log(output);
      // } catch (error) {
      //   output = {
      //     status: "error",
      //     from:"Full Error",
      //     message: error,

      //   };
      // }
    }
  }

  await fetchContractData();

  res.status(200).json(output)
}


// Sample Data
// {
//   "privatekey": "aabb7f566f8f7c2d9f6ca79c45a160d6f015cccca8d29fbb367d78c7e0111113",
//   "BidPrice": 0.05
// }


