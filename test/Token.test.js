require('chai')
  .use(require('chai-as-promised'))
  .should()

const Token = artifacts.require('./Token');

contract('Token', (accounts) => {
  const name = "USD Token"
  const symbol = "USD"
  const decimals = "18"
  const totalSupply = "1000000000000000000000000"
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

      result.toString().should.equal(totalSupply)
    })
  })
})
