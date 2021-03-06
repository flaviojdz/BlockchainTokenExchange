import { Component } from "react";
import { Tabs, Tab } from "react-bootstrap";

import { connect } from "react-redux";
import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged,
} from "../store/actions";
import {
  depositEther,
  depositToken,
  loadBalances,
  withdrawEther,
  withdrawToken,
} from "../store/interactions";
import {
  web3Selector,
  exchangeSelector,
  tokenSelector,
  accountSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  balancesLoadingSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector,
} from "../store/selectors";
import Spinner from "./Spinner";

const showForm = (props) => {
  const {
    dispatch,
    etherBalance,
    tokenBalance,
    exchangeEtherBalance,
    exchangeTokenBalance,
    etherDepositAmount,
    etherWithdrawAmount,
    tokenDepositAmount,
    tokenWithdrawAmount,
    web3,
    exchange,
    token,
    account,
  } = props;
  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-whiteid=">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Wallet</th>
              <th scope="col">Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            depositEther(dispatch, exchange, web3, etherDepositAmount, account);
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <div>
              <input
                type="text"
                name="Ether Amount"
                placeholder="ETH Amount"
                onChange={(e) =>
                  dispatch(etherDepositAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto pr-sm-2">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>
        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>J23</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            depositToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenDepositAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <div>
              <input
                type="text"
                name="J Token Amount"
                placeholder="J23 Amount"
                onChange={(e) =>
                  dispatch(tokenDepositAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto pr-sm-2">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>
      </Tab>
      <Tab eventKey="withdraw" title="Withdraw">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Wallet</th>
              <th scope="col">Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            withdrawEther(
              dispatch,
              exchange,
              web3,
              etherWithdrawAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <div>
              <input
                type="text"
                name="Ether Amount"
                placeholder="ETH Amount"
                onChange={(e) =>
                  dispatch(etherWithdrawAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto pr-sm-2">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>
        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>J23</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            withdrawToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenWithdrawAmount,
              account
            );
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <div>
              <input
                type="text"
                name="J Token Amount"
                placeholder="J23 Amount"
                onChange={(e) =>
                  dispatch(tokenWithdrawAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="col-12 col-sm-auto pr-sm-2">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>
      </Tab>
    </Tabs>
  );
};

class Balance extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props);
  }

  async loadBlockchainData(props) {
    const { dispatch, web3, exchange, token, account } = props;
    await loadBalances(dispatch, web3, exchange, token, account);
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">Balance</div>
        <div className="card-body">
          {this.props.showForm ? showForm(this.props) : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const balancesLoading = balancesLoadingSelector(state);
  return {
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading,
    showForm: !balancesLoading,
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
  };
}

export default connect(mapStateToProps)(Balance);
