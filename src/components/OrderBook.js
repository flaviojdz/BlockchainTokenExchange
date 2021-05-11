import { Component } from "react";
import { connect } from "react-redux";
import { orderBookLoadedSelector, orderBookSelector } from "../store/selectors";
import Spinner from "./Spinner";

const renderOrder = (order) => {
  return (
    <tr key={order.id}>
      <td>{order.tokenAmount}</td>
      <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
      <td>{order.etherAmount}</td>
    </tr>
  );
};

const showOrderBook = (props) => {
  const { orderBook } = props;
  return (
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order))}
      <tr>
        <th scope="col">J23</th>
        <th scope="col">J23/ETH</th>
        <th scope="col">ETH</th>
      </tr>

      {orderBook.buyOrders.map((order) => renderOrder(order))}
    </tbody>
  );
};

class OrdersBook extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">Order Book</div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              {this.props.showOrderBook ? (
                showOrderBook(this.props)
              ) : (
                <Spinner />
              )}
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showOrderBook: orderBookLoadedSelector(state),
    orderBook: orderBookSelector(state),
  };
}

export default connect(mapStateToProps)(OrdersBook);
