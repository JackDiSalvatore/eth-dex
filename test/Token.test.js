require('chai')
  .use(require('chai-as-promised'))
  .should()

import { tokens, EVM_REVERT } from './helpers'
const Token = artifacts.require('./Token')

contract('Token', ([deployer, receiver]) => {
  const name = "USD Token"
  const symbol = "USD"
  const decimals = "18"
  const totalSupply = tokens(1000000)
  let token

  beforeEach(async () => {
    token = await Token.new()
  })

  describe('deployment', () => {
    it('tracts the name', async () => {
      const result = await token.name()
      result.should.equal(name)
    })

    it('tracts the symbol', async () => {
      const result = await token.symbol()
      result.should.equal(symbol)
    })

    it('tracts the decimals', async () => {
      const result = await token.decimals()
      result.toString().should.equal(decimals)
    })

    it('tracts the total supply', async () => {
      const result = await token.totalSupply()
      result.toString().should.equal(totalSupply.toString())
    })

    it('assigns the total supply to the deployer', async () => {
      const result = await token.balanceOf(deployer)
      result.toString().should.equal(totalSupply.toString())
    })
  })

  describe('sending tokens', () => {
    let result
    let amount

    describe('success', async() => {
      beforeEach(async () => {
        amount = tokens(100)
        result = await token.transfer(receiver, amount, { from: deployer })
      })
  
      it('transfers token balances', async () => {
        let balanceOf = await token.balanceOf(deployer)
        balanceOf.toString().should.equal(tokens(999900).toString())
        balanceOf = await token.balanceOf(receiver)
        balanceOf.toString().should.equal(tokens(100).toString())
      })
  
      it('emits a transfer event', async () => {
        const log = result.logs[0]
        log.event.should.equal('Transfer')
  
        const event = log.args
        event.from.toString().should.equal(deployer, 'from is correct')
        event.to.toString().should.equal(receiver, 'to is correct')
        event.value.toString().should.equal(amount.toString(), 'value is correct')
      })
    })

    describe('failure', async() => {  
      it('rejects insufficient token balances', async () => {
        // overdraw balance
        let invalidAmount = tokens(1000001)
        await token.transfer(receiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT)

        // transfer tokens when you have none
        invalidAmount = tokens(10)
        await token.transfer(deployer, invalidAmount, { from: receiver })
          .should.be.rejectedWith(EVM_REVERT)
      })

      it('rejects invlaid recipients', async() => {
        await token.transfer(0x0, amount, { from: deployer })
          .should.be.rejected
      })
    })

  })
})
