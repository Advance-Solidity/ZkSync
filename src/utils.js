


/*Create a provider
Before you interact with zkSync, you must create something called a provider.
A provider works like a bridge that makes JavaScript function calls compatible with zkSync. 
The beauty of it is that, to use it, you don't have to understand how it works under the hood.*/

async function getZkSyncProvider (zksync, networkName) {
    let zkSyncProvider
    try {
    zkSyncProvider = await zksync.getDefaultProvider(networkName)
    } catch (error) {
    console.log('Unable to connect to zkSync.')
    console.log(error)
    }
    return zkSyncProvider
}

async function getEthereumProvider (ethers, networkName) {
    let ethersProvider
    try {
    // eslint-disable-next-line new-cap
    ethersProvider = new ethers.getDefaultProvider(networkName)
    } catch (error) {
    console.log('Could not connect to Rinkeby')
    console.log(error)
    }
    return ethersProvider
}

async function initAccount(rinkebyWallet, zkSyncProvider,zksync){
    const zkSyncWallet = await zksync.Wallet.fromEthSigner(rinkebyWallet, zkSyncProvider)
    return zkSyncWallet
}