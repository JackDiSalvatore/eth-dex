import React, { Component } from 'react'
import './App.css'
import Web3 from 'web3'
import Token from '../abis/Token.json'

class App extends Component {

  componentDidMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    // Create web3 connection
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545')
    // Detect network connected to
    const network = await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    console.log('network: ', network)
    
    // Get accounts
    const accounts = await web3.eth.getAccounts()
    console.log('accounts: ', accounts)

    // Get Token contract
    const token_abi = Token.abi
    const token_address = Token.networks[networkId].address
    const token = web3.eth.Contract(token_abi, token_address)
    console.log('Token: ', token)

    const totalSupply = await token.methods.totalSupply().call()
    console.log('Token supply: ', totalSupply)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="/#">Navbar</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 1</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 2</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">Link 3</a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="content">

          {/* LEFT SIDE BAR */}
          <div className="vertical-split">

            <div className="card bg-dark text-white">
              <div className="card-header">
                DEPOSIT / WITHDRAW
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>

            <div className="card bg-dark text-white">
              <div className="card-header">
                BUY / SELL
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
                ORDER BOOK
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical-split">
            <div className="card bg-dark text-white">
              <div className="card-header">
                PRICE CHART
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
                OPEN ORDERS
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
                TRADE HISTORY
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

export default App;
