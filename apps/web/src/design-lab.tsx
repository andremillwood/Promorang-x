import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DesignLabSuite from "./pages/DesignLabSuite";

const root = document.getElementById("design-lab-root");

if (!root) {
  throw new Error("Missing #design-lab-root");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DesignLabSuite />
  </React.StrictMode>,
);
