const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts()
  feeAccount = accounts[0]
  feePercent = 10

  await deployer.deploy(Token)
  await deployer.deploy(Exchange, feeAccount, feePercent)
};
