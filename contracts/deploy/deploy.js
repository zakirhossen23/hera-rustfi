
// Just a standard hardhat-deploy deployment definition file!
const func = async (hre) => {
	const { deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	const name = 'Aurora';
	const symbol = 'Aurora';

	await deploy('AuroraERC721', {
		from: deployer,
		args: [name, symbol],
		log: true,
	});
};

func.tags = ['Aurora'];
module.exports = func;