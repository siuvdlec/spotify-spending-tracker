import * as React from 'react'
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { data } from "./DB";

createRoot(document.getElementById("root")).render(<App {...data} />);
