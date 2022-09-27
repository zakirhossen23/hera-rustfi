import { useState, useEffect } from "react";
import { ethers } from "ethers";

import ERC721Singleton from "./ERC721Singleton";

export default function useContract() {
  const [contractInstance, setContractInstance] = useState({
    contract: null,
    signerAddress: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const etherProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );

        const signer = etherProvider.getSigner();
        const contract = { contract: null, signerAddress: null };

        // Sets a single instance of a specific contract per application
        // Useful for switching across multiple contracts in a single application

        contract.contract = ERC721Singleton(signer);

        contract.signerAddress = await signer.getAddress();

        setContractInstance(contract);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return contractInstance;
}
