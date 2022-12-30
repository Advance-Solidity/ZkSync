


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
    // Let’s talk to zkSync

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

    // Create a new zkSync account

async function initAccount(rinkebyWallet, zkSyncProvider,zksync){
    const zkSyncWallet = await zksync.Wallet.fromEthSigner(rinkebyWallet, zkSyncProvider)
    return zkSyncWallet
}

// Create a new zkSync account - continued
async function registerAccount (wallet) {
    console.log(`Registering the ${wallet.address()} account on zkSync`)
    if (!await wallet.isSigningKeySet()) {
        if (await wallet.getAccountId() === undefined) {
        throw new Error('Unknown account')
    }
    const changePubkey = await wallet.setSigningKey()
    await changePubkey.awaitReceipt()
    }
    console.log(`Account ${wallet.address()} registered`)
}

    //Deposit assets to zkSync


    
async function depositToZkSync (zkSyncWallet, token, amountToDeposit, ethers) {
    const deposit = await zkSyncWallet.depositToSyncFromEthereum({
        depositTo: zkSyncWallet.address(),
        token: token,
        amount: ethers.utils.parseEther(amountToDeposit)
        })
    try {
    await deposit.awaitReceipt()
    } catch (error) {
        console.log('Error while awaiting confirmation from the zkSync operators.')
        console.log(error)
    }
}


    //Transfer assets on zkSync


    
async function transfer (from, toAddress, amountToTransfer, transferFee, token, zksync, ethers) {
    const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountToTransfer))
    const closestPackableFee = zksync.utils.closestPackableTransactionFee(
    ethers.utils.parseEther(transferFee))

    const transfer = await from.syncTransfer({
    to: toAddress,
    token: token,
    amount: closestPackableAmount,
    fee: closestPackableFee
    })
    const transferReceipt = await transfer.awaitReceipt()
    console.log('Got transfer receipt.')
    console.log(transferReceipt)
}

    //Transfer fees
/*
As the protocol performs the computation and stores the state off-chain, the fees users must pay are comprised of two separated components:

    1.  off-chain fee, representing the cost of computation and storage. This component is invariable
    2.  on-chain fee, representing the cost of verifying the SNARK on Ethereum. This cost is amortized across all transactions in a block, 
    and it's variable because it depends on the price of gas.
*/

async function getFee(transactionType, address, token, zkSyncProvider, ethers) {
    const feeInWei = await zkSyncProvider.getTransactionFee(transactionType, address, token);
    const Fee= ethers.utils.formatEther(feeInWei.totalFee.toString());
    return Fee;
}


//  Withdraw to Ethereum


async function withdrawToEthereum (wallet, amountToWithdraw, withdrawalFee, token, zksync, ethers) {
    const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(ethers.utils.parseEther(amountToWithdraw))
    const closestPackableFee = zksync.utils.closestPackableTransactionFee(ethers.utils.parseEther(withdrawalFee))
    const withdraw = await wallet.withdrawFromSyncToEthereum({
        ethAddress: wallet.address(),
        token: token,
        amount: closestPackableAmount,
        fee: closestPackableFee
    })
    await withdraw.awaitVerifyReceipt()
    console.log('ZKP verification is complete')
}



//Account balances
/*
Remember that you can receive some tokens and then immediately send those tokens to another user as part of a different transaction?
 How can that be possible if the protocol waits for the transaction to be mined on Ethereum? The answer is that there are two types
  of balances on zkSync 
    1.committed and 
    2. verified 
    and you can use the assets in your committed balance as you wish.

    Just to make things clear:

The committed balance includes all verified and committed transactions
The verified balance includes only verified transactions
There are two way in which you can retrieve the balances for an account:
*/


async function displayZkSyncBalance (wallet, ethers) {
    const state = await wallet.getAccountState()

    if (state.committed.balances.ETH) {
    console.log(`Commited ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.committed.balances.ETH)}`)
    } else {
    console.log(`Commited ETH balance for ${wallet.address()}: 0`)
    }

    if (state.verified.balances.ETH) {
    console.log(`Verified ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(state.verified.balances.ETH)}`)
    } else {
    console.log(`Verified ETH balance for ${wallet.address()}: 0`)
    }
}





