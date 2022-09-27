const CONTRACT_NAME =  'hera-near.testnet'; /* TODO: fill this in! */

function getConfig () {

  return {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org'
  }
}

module.exports = getConfig
