import * as React from 'react'
import ReactDOM from "react-dom";
import { App } from "./App";
import { data } from "./data";

ReactDOM.render(<App {...data} />, document.getElementById("root"));
