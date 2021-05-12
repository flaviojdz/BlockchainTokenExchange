import {
  allOrdersLoaded,
  cancelledOrdersLoaded,
  exchangeLoaded,
  filledOrdersLoaded,
  tokenLoaded,
  web3AccountLoaded,
  web3Loaded,
  orderCancelling,
  orderCancelled,
} from "./actions";
import Exchange from "../abis/Exchange.json";
import Token from "../abis/Token.json";
import Web3 from "web3";

export const loadWeb3 = async (dispatch) => {
  if (typeof window.ethereum === "undefined") {
    window.alert("Please install MetaMask");
    window.location.assign("https://metamask.io/");
    return null;
  }

  const web3 = new Web3(window.ethereum);
  dispatch(web3Loaded(web3));
  return web3;
};

export const loadAccount = async (web3, dispatch) => {
  if (typeof window.ethereum === "undefined") {
    window.alert("Please install MetaMask");
    window.location.assign("https://metamask.io/");
    return null;
  }

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  dispatch(web3AccountLoaded(account));
  return account;
};

export const loadToken = async (web3, networkId, dispatch) => {
  if (typeof window.ethereum === "undefined") {
    return null;
  }
  try {
    const token = new web3.eth.Contract(
      Token.abi,
      Token.networks[networkId].address
    );
    dispatch(tokenLoaded(token));
    return token;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadExchange = async (web3, networkId, dispatch) => {
  if (typeof window.ethereum === "undefined") {
    return null;
  }
  try {
    const exchange = new web3.eth.Contract(
      Exchange.abi,
      Exchange.networks[networkId].address
    );
    dispatch(exchangeLoaded(exchange));
    return exchange;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadAllOrders = async (exchange, dispatch) => {
  const cancelStream = await exchange.getPastEvents("Cancel", {
    fromBlock: 0,
    toBlock: "latest",
  });
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  const tradeStream = await exchange.getPastEvents("Trade", {
    fromBlock: 0,
    toBlock: "latest",
  });
  const filledOrders = tradeStream.map((event) => event.returnValues);
  dispatch(filledOrdersLoaded(filledOrders));

  const orderStream = await exchange.getPastEvents("Order", {
    fromBlock: 0,
    toBlock: "latest",
  });
  const allOrders = orderStream.map((event) => event.returnValues);
  dispatch(allOrdersLoaded(allOrders));
};

export const cancelOrder = (dispatch, exchange, order, account) => {
  exchange.methods
    .cancelOrder(order.id)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      dispatch(orderCancelling());
    })
    .on("error", (error) => {
      console.log(error);
      window.alert("There was an error cancelling the order!");
    });
};

export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues));
  });
};
