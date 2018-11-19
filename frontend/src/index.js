import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";
import { ToastContainer } from "react-toastify";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";
import 'react-toastify/dist/ReactToastify.min.css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import './css/chat.scss';
import { initSocket } from "./services/socketManager";

initSocket();

ReactDOM.render(
  <BrowserRouter>
    <div>
      <ToastContainer />
      <App />
    </div>
  </BrowserRouter>,
  document.getElementById("root")
);
registerServiceWorker();