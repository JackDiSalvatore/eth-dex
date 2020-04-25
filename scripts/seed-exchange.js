const Token = artifacts.require('Token')
const Exchange = artifacts.require('Exchange')

// Utils
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

const tokens = (n) => ether(n)

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {

  try {
    const accounts = await web3.eth.getAccounts()

    // Fetch deployed Token contract
    const token = await Token.deployed()
    console.log('Token fetched', token.address)
  
    // Fetch the deployed exchange
    const exchange = await Exchange.deployed()
    console.log('Exchange fetched', exchange.address)
  
    // Give Tokens to user2 - account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = web3.utils.toWei('10000', 'ether') // 10,000 tokens
  
    await token.transfer(receiver, amount, { from: sender })
    console.log(`Transferred ${amount} Tokens from ${sender} to ${receiver}`)
  
    // Set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]
  
    // user1 deposits 1 Ether in the exchange
    amount = 1 // ETH
    await exchange.depositEther({ from: user1, value: ether(amount) })
    console.log(`Deposited ${amount} Ether from ${user1}`)
  
    // user2 approves exchange to spend 10,000 Tokens
    amount = 10000
    await token.approve(exchange.address, tokens(amount), { from: user2 })
    console.log(`Approved ${amount} Tokens to ${exchange.address} from ${user2}`)
  
    // user2 deposits 1 Token
    await exchange.depositToken(token.address, tokens(amount), { from: user2 })
    console.log(`Deposited ${amount} Tokens from ${user1}`)
  
    ////////////////////////////////////////////////////////////////////////////
    //  Seed Cancelled Order
    //
  
    // user1 makes order to get tokens
    await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
    console.log(`Make order from ${user1}`)
  
    // user1 cancels order
    await exchange.cancelOrder(1, { from: user1 })
    console.log(`Cancelled order ${1} from ${user1}`)
  
    ////////////////////////////////////////////////////////////////////////////
    //  Seed Filled Order
    //
  
    // user1 makes order to get tokens
    result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
    console.log(`Make order from ${user1}`)
    // user2 fills the order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order ${orderId} from ${user1} by ${user2}`)
  
    await wait(1)
  
    // user1 makes order to get tokens
    result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), { from: user1 })
    console.log(`Make order from ${user1}`)
    // user2 fills the order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order ${orderId} from ${user1} by ${user2}`)
  
    await wait(1)
  
    // user1 makes order to get tokens
    result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), { from: user1 })
    console.log(`Make order from ${user1}`)
    // user2 fills the order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order ${orderId} from ${user1} by ${user2}`)
  
    await wait(1)
  
    ////////////////////////////////////////////////////////////////////////////
    //  Seed Filled Order
    //

    // user1 makes 10 orders
    for(let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, ether(0.01), { from: user1 })
      console.log(`Make order from ${user1}`)
      await wait(1)
    }

    // user2 makes 10 orders
    for(let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), { from: user1 })
      console.log(`Make order from ${user1}`)
      await wait(1)
    }
  } catch(error) {
    console.log(error)
  }

  callback()
}