import Web3 from "web3";

import erc721 from "../../contracts/deployments/testnet_aurora/AuroraERC721.json";

export default function useContract(privateKey) {
  let contract = null;
  const fetchData = async () => {
    try {
      const web3 = new Web3("https://testnet.aurora.dev");
      web3.eth.accounts.wallet.add(privateKey); //Adding private key

      contract = new web3.eth.Contract(erc721.abi, erc721.address).methods;
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
  return contract;
}
