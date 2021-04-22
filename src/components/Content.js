import { Component } from "react";
import "./App.css";
import Web3 from "web3";
import Token from "../abis/Token.json";
import {
  loadAccount,
  loadAllOrders,
  loadExchange,
  loadToken,
  loadWeb3,
} from "../store/interactions";
import { connect } from "react-redux";
import { accountSelector, exchangeSelector } from "../store/selectors";
import OrdersBook from "./OrdersBook";
import Trades from "./Trades";
class Content extends Component {
  componentWillMount() {
    this.loadBlockchainData2(this.props.dispatch);
  }

  async loadBlockchainData2(dispatch) {
    await loadAllOrders(this.props.exchange, dispatch);
  }
  render() {
    return (
      <div className="content">
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
        </div>
        <OrdersBook />
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
        </div>
        <Trades />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state),
  };
}

export default connect(mapStateToProps)(Content);
