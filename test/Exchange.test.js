require('chai')
  .use(require('chai-as-promised'))
  .should()

import { ether, tokens, EVM_REVERT, ETHER_ADDRESS } from './helpers'
const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

contract('Exchange', ([deployer, feeAccount, user1]) => {
  let token
  let exchange
  const feePercent = 10

  beforeEach(async () => {
    token = await Token.new()
    exchange = await Exchange.new(feeAccount, feePercent)

    token.transfer(user1, tokens(100), { from: deployer })
  })

  describe('deployment', () => {
    it('tracts the fee account', async () => {
      const result = await exchange.feeAccount()
      result.should.equal(feeAccount)
    })

    it('tracts the fee percent', async () => {
      const result = await exchange.feePercent()
      result.toString().should.equal(feePercent.toString())
    })
  })

  describe('fallback', () => {
    it('reverts when Ether is sent directly', async () => {
      await exchange.sendTransaction({ value: 1, from: user1 })
        .should.be.rejectedWith(EVM_REVERT)
    })
  })

  describe('depositing Ether', () => {
    let result
    let amount

    beforeEach(async () => {
      amount = ether(1)
      result = await exchange.depositEther({ from: user1, value: amount })
    })

    it('tracts the Ether deposit', async() => {
      let balance = await exchange.tokens(ETHER_ADDRESS, user1)
      balance.toString().should.equal(amount.toString())
    })

    it('emits a Deposit event', async () => {
      const log = result.logs[0]
      log.event.should.eq('Deposit')
      const event = log.args
      event.token.toString().should.equal(ETHER_ADDRESS, 'from is correct')
      event.user.should.equal(user1, 'to is correct')
      event.amount.toString().should.equal(amount.toString(), 'value is correct')
      event.balance.toString().should.equal(amount.toString(), 'value is correct')
    })
  })

  describe('depositing tokens', () => {
    let result
    let amount = tokens(10)

    describe('success', () => {
      beforeEach(async () => {
        await token.approve(exchange.address, amount, { from: user1 })
        result = await exchange.depositToken(token.address, amount, { from: user1 })
      })

      it('tracts the token deposit', async() => {
        let balance = await token.balanceOf(exchange.address)
        balance.toString().should.equal(amount.toString())

        balance = await exchange.tokens(token.address, user1)
        balance.toString().should.equal(amount.toString())
      })

      it('emits a Deposit event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Deposit')
        const event = log.args
        event.token.toString().should.equal(token.address, 'from is correct')
        event.user.should.equal(user1, 'to is correct')
        event.amount.toString().should.equal(amount.toString(), 'value is correct')
        event.balance.toString().should.equal(amount.toString(), 'value is correct')
      })
    })

    describe('failure', () => {
      it('rejects Ether deposits', async() => {
        await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT)
      })

      it('fails when no tokens are approved', async() => {
        await exchange.depositToken(token.address, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT)
      })
    })

  })

})
