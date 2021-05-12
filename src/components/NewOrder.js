import { Component } from "react";
import { connect } from "react-redux";

import { Tabs, Tab } from "react-bootstrap";
import {
  accountSelector,
  buyOrderSelector,
  exchangeSelector,
  sellOrderSelector,
  tokenSelector,
  web3Selector,
} from "../store/selectors";
import { makeBuyOrder, makeSellOrder } from "../store/interactions";
import {
  buyOrderAmountChanged,
  buyOrderPriceChanged,
  sellOrderAmountChanged,
  sellOrderPriceChanged,
} from "../store/actions";
import Spinner from "./Spinner";

const showForm = (props) => {
  const {
    dispatch,
    exchange,
    web3,
    token,
    buyOrder,
    account,
    showBuyTotal,
    sellOrder,
    showSellTotal,
  } = props;
  return (
    <Tabs defaultActiveKey="buy" className="bg-dark text-whiteid=">
      <Tab eventKey="buy" title="Buy" className="bg-dark">
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            makeBuyOrder(dispatch, exchange, web3, token, buyOrder, account);
          }}
        >
          <div className="form-group small">
            <label>Buy Amount (J23)</label>
            <div className="input-group">
              <input
                type="text"
                name="Buy Amount"
                placeholder="Buy Amount"
                onChange={(e) =>
                  dispatch(buyOrderAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Buy Price</label>
            <div className="input-group">
              <input
                type="text"
                name="Buy Price"
                placeholder="Buy Price"
                onChange={(e) => dispatch(buyOrderPriceChanged(e.target.value))}
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-sm">
            Make Buy Order
          </button>
          {showBuyTotal ? (
            <small>Total: {buyOrder.amount * buyOrder.price} ETH</small>
          ) : null}
        </form>
      </Tab>
      <Tab eventKey="sell" title="Sell" className="bg-dark">
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            makeSellOrder(dispatch, exchange, web3, token, sellOrder, account);
          }}
        >
          <div className="form-group small">
            <label>Sell Amount (J23)</label>
            <div className="input-group">
              <input
                type="text"
                name="Sell Amount"
                placeholder="Sell Amount"
                onChange={(e) =>
                  dispatch(sellOrderAmountChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Buy Price</label>
            <div className="input-group">
              <input
                type="text"
                name="Sell Price"
                placeholder="Sell Price"
                onChange={(e) =>
                  dispatch(sellOrderPriceChanged(e.target.value))
                }
                className="form-control form-control-sm bg-dark text-white"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-sm">
            Make Sell Order
          </button>
          {showSellTotal ? (
            <small>Total: {sellOrder.amount * sellOrder.price} ETH</small>
          ) : null}
        </form>
      </Tab>
    </Tabs>
  );
};

class NewOrder extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">New Order</div>
        <div className="card-body">
          {this.props.showForm ? showForm(this.props) : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const buyOrder = buyOrderSelector(state);
  const sellOrder = sellOrderSelector(state);

  return {
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    buyOrder,
    sellOrder,
    showForm: !buyOrder.making && !sellOrder.making,
    showBuyTotal: buyOrder.amount && buyOrder.price,
    showSellTotal: sellOrder.amount && sellOrder.price,
  };
}

export default connect(mapStateToProps)(NewOrder);
