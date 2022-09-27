import { ethers } from 'ethers';
const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export default async function send_token(
	send_token_amount,
	to_address,
	private_key
	) {
			
		const Web3 = require("web3")
		const HDWalletProvider = require("@truffle/hdwallet-provider");
		const localKeyProvider = new HDWalletProvider({
			privateKeys: [private_key],
			providerOrUrl: "https://testnet.aurora.dev",
		});
		const web3 = new Web3(localKeyProvider);
	
		let send_account =  await  web3.eth.accounts.privateKeyToAccount(private_key).address;
		let AmountinFull = (Number(send_token_amount) * 1000000000000000000).toLocaleString('fullwide', { useGrouping: false });
		
		try {
			const transaction = {
				from: send_account,
				to: to_address,
				value: AmountinFull,
				gasPrice: 1000000000,
				gas: 500_000,
			  }
		
			  const contractData = await web3.eth.sendTransaction(transaction) 
			  
				let transactionReceipt = null;
			while (transactionReceipt == null) { 
				transactionReceipt = await web3.eth.getTransactionReceipt(contractData.transactionHash);
				await sleep(1000)
			}

		} catch (error) {
			console.log(error)
		}
		

	return send_account;
}