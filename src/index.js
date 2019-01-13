import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import history from "./modules/history";
import "./index.css";
import App from "./App";

// basename={'/m/pipeline'}

ReactDOM.render(
    <Router history={history}>
        <App />
    </Router>,
    document.getElementById("root")
);
