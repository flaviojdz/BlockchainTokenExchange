import { Provider } from "react-redux";
import App from "./components/App";
import configureStore from "./store/configureStore";
import reportWebVitals from "./reportWebVitals";
import React from "react";
import ReactDOM, { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);
