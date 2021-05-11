import "./App.css";
import { Component } from "react";
import {
  loadAccount,
  loadExchange,
  loadToken,
  loadWeb3,
} from "../store/interactions";
import { connect } from "react-redux";
import Content from "./Content";
import Navbar from "./Navbar";
import { contractsLoadedSelector } from "../store/selectors";

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch);
    await loadAccount(web3, dispatch);
    const networkId = await web3.eth.net.getId();
    const token = await loadToken(web3, networkId, dispatch);
    const exchange = await loadExchange(web3, networkId, dispatch);

    if (!token | !exchange) {
      window.alert(
        "Smart contract not detected on current network, Try another metamask network"
      );
      return;
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? (
          <Content />
        ) : (
          <div className="content"></div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
  };
}

export default connect(mapStateToProps)(App);
