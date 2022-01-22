import * as React from 'react'
import ReactDOM from "react-dom";
import { App } from "./App";
import { data } from "./DB";

ReactDOM.render(<App {...data} />, document.getElementById("root"));
