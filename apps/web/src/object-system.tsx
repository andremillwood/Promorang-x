import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import CanonicalObjectSystemV1 from "@/pages/object-system/CanonicalObjectSystemV1";
import "./index.css";
import "./object-system.css";

const rootElement = document.getElementById("object-system-root");
if (!rootElement) throw new Error("Missing #object-system-root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <CanonicalObjectSystemV1 />
    </HashRouter>
  </React.StrictMode>,
);
